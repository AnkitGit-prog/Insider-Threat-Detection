"""
prediction.py
-------------
Core prediction logic.

Responsibilities:
  - Enforce the EXACT 39-feature names and order as stored in the trained model.
  - Validate and coerce incoming data.
  - Run inference and build a rich XAI (Explainable AI) response.
"""

import numpy as np
import pandas as pd
from model_loader import get_model

# ──────────────────────────────────────────────────────────
# Feature contract – derived directly from model.feature_names_in_
# DO NOT change the order; it must match training.
# ──────────────────────────────────────────────────────────
FEATURE_NAMES = [
    "total_logons",
    "total_logoffs",
    "after_hours_logons",
    "weekend_logins",
    "unique_pc_used",
    "working_days",
    "average_logons_per_day",
    "usb_connects",
    "usb_disconnects",
    "after_hours_usb",
    "weekend_usb",
    "unique_usb_pc",
    "usb_working_days",
    "emails_sent",
    "after_hours_emails",
    "weekend_emails",
    "total_attachments",
    "avg_email_size",
    "unique_receivers",
    "external_emails",
    "files_accessed",
    "after_hours_files",
    "weekend_files",
    "unique_file_types",
    "suspicious_files",
    "pdf_files",
    "doc_files",
    "image_files",
    "web_requests",
    "after_hours_web",
    "weekend_web",
    "social_visits",
    "cloud_storage_visits",
    "job_portal_visits",
    "O",   # Openness
    "C",   # Conscientiousness
    "E",   # Extraversion
    "A",   # Agreeableness
    "N",   # Neuroticism
]

FEATURE_COUNT = len(FEATURE_NAMES)  # 39

# Human-readable labels for the OCEAN personality features
FEATURE_LABELS = {
    "O": "Openness (OCEAN)",
    "C": "Conscientiousness (OCEAN)",
    "E": "Extraversion (OCEAN)",
    "A": "Agreeableness (OCEAN)",
    "N": "Neuroticism (OCEAN)",
}


def _validate_features(data: dict) -> dict:
    """
    Validate and coerce the incoming data dictionary.

    Returns:
        Cleaned dict with exactly FEATURE_NAMES keys.

    Raises:
        ValueError: if a required feature is missing or non-numeric.
    """
    cleaned = {}
    errors = []

    for feat in FEATURE_NAMES:
        if feat not in data:
            errors.append(f"Missing required feature: '{feat}'")
            continue
        try:
            val = float(data[feat])
            if np.isnan(val) or np.isinf(val):
                errors.append(f"Feature '{feat}' must be a finite number.")
            else:
                cleaned[feat] = val
        except (TypeError, ValueError):
            errors.append(f"Feature '{feat}' must be numeric. Got: {data[feat]!r}")

    if errors:
        raise ValueError(errors)

    return cleaned


def _compute_risk_score(prob_threat: float) -> int:
    """Convert raw threat probability to an integer 0–100 risk score."""
    return int(round(prob_threat * 100))


def _determine_risk_level(prob_threat: float) -> str:
    """Map threat probability to a human-readable risk tier."""
    if prob_threat < 0.30:
        return "Low"
    elif prob_threat < 0.60:
        return "Medium"
    elif prob_threat < 0.80:
        return "High"
    else:
        return "Critical"


def _top_contributing_features(feature_values: np.ndarray, n: int = 8) -> list:
    """
    Use the model's global feature importances combined with the individual
    feature values to produce a per-sample explanation.

    Strategy:
        contribution = global_importance × |normalised_feature_value|
    This gives a fast, model-native approximation without requiring SHAP.
    """
    model = get_model()
    importances = model.feature_importances_  # shape: (39,)

    # Normalise feature values to [0, 1] range for fair comparison
    max_val = np.abs(feature_values).max()
    normed = np.abs(feature_values) / (max_val + 1e-9)

    contributions = importances * normed
    top_indices = np.argsort(contributions)[::-1][:n]

    result = []
    for idx in top_indices:
        fname = FEATURE_NAMES[idx]
        label = FEATURE_LABELS.get(fname, fname.replace("_", " ").title())
        result.append({
            "feature": fname,
            "label": label,
            "importance": round(float(importances[idx]), 4),
            "value": round(float(feature_values[idx]), 4),
            "contribution": round(float(contributions[idx]), 4),
        })
    return result


def _build_recommendation(prediction: int, risk_level: str, top_features: list) -> str:
    """Generate a human-readable risk-based recommendation."""
    if prediction == 0:
        return (
            "No immediate action required. Continue standard monitoring. "
            "Review again if unusual behaviour is detected."
        )
    if risk_level == "Medium":
        return (
            "Increase monitoring frequency for this employee. "
            "Review recent USB and file access activity. "
            "Consider a casual policy-awareness conversation."
        )
    if risk_level == "High":
        return (
            "Immediately flag for Level-2 security review. "
            "Audit USB device usage and file transfers in the last 30 days. "
            "Restrict access to sensitive data pending investigation."
        )
    # Critical
    top_names = ", ".join(f["label"] for f in top_features[:3])
    return (
        f"CRITICAL: Escalate to the SOC team immediately. "
        f"Key risk indicators: {top_names}. "
        f"Consider temporary account suspension and forensic investigation."
    )


def run_single_prediction(raw_data: dict) -> dict:
    """
    Full prediction pipeline for a single employee record.

    Args:
        raw_data: dict of feature_name → value (strings or numbers).

    Returns:
        dict with prediction, confidence, risk score, top features, recommendation.
    """
    # 1. Validate
    cleaned = _validate_features(raw_data)

    # 2. Build a single-row DataFrame in the exact training column order
    df = pd.DataFrame([cleaned], columns=FEATURE_NAMES)

    # 3. Inference
    model = get_model()
    prediction = int(model.predict(df)[0])
    probabilities = model.predict_proba(df)[0]  # [P(Normal), P(Threat)]

    prob_normal = float(probabilities[0])
    prob_threat = float(probabilities[1])
    confidence = round(max(prob_normal, prob_threat) * 100, 2)

    risk_score = _compute_risk_score(prob_threat)
    risk_level = _determine_risk_level(prob_threat)

    feature_arr = df.values[0]  # numpy array of the 39 feature values
    top_features = _top_contributing_features(feature_arr)
    recommendation = _build_recommendation(prediction, risk_level, top_features)

    return {
        "prediction": prediction,
        "label": "Insider Threat" if prediction == 1 else "Normal",
        "confidence": confidence,
        "probability_normal": round(prob_normal * 100, 2),
        "probability_threat": round(prob_threat * 100, 2),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "top_contributing_features": top_features,
        "recommendation": recommendation,
        "features_used": FEATURE_NAMES,
        "feature_count": FEATURE_COUNT,
    }


def run_batch_prediction(df_input: pd.DataFrame) -> list:
    """
    Batch prediction on a DataFrame.

    Args:
        df_input: DataFrame with at least the 39 required columns.

    Returns:
        List of prediction dicts (one per row).
    """
    # Verify all required columns are present
    missing = [f for f in FEATURE_NAMES if f not in df_input.columns]
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    # Reorder to exact training column order and drop extras
    df = df_input[FEATURE_NAMES].copy()

    # Coerce to numeric, fill NaN with 0 (edge case)
    for col in FEATURE_NAMES:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    model = get_model()
    predictions = model.predict(df)
    probabilities = model.predict_proba(df)

    results = []
    for i, (pred, proba) in enumerate(zip(predictions, probabilities)):
        prob_normal = float(proba[0])
        prob_threat = float(proba[1])
        risk_score = _compute_risk_score(prob_threat)
        risk_level = _determine_risk_level(prob_threat)
        top_features = _top_contributing_features(df.values[i])

        # Try to get an employee ID from common column names
        row_raw = df_input.iloc[i]
        emp_id = (
            str(row_raw.get("employee_id", row_raw.get("emp_id", row_raw.get("id", f"EMP-{i+1:04d}"))))
        )

        results.append({
            "row_index": i + 1,
            "employee_id": emp_id,
            "prediction": int(pred),
            "label": "Insider Threat" if int(pred) == 1 else "Normal",
            "confidence": round(max(prob_normal, prob_threat) * 100, 2),
            "probability_normal": round(prob_normal * 100, 2),
            "probability_threat": round(prob_threat * 100, 2),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "top_contributing_features": top_features,
        })

    return results
