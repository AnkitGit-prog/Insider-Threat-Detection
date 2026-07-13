"""
routes.py
---------
All Flask API route definitions.

Endpoints:
  GET  /health           → Server + model health status
  GET  /model-info       → Model metadata & feature importances
  GET  /analytics        → Aggregated stats from in-memory prediction history
  POST /predict          → Single employee prediction (JSON body)
  POST /predict-csv      → Batch prediction (multipart CSV upload)
"""

import io
import json
import datetime
from flask import Blueprint, request, jsonify, make_response
import pandas as pd

from model_loader import get_model, get_model_info
from prediction import run_single_prediction, run_batch_prediction, FEATURE_NAMES
from utils import (
    success_response,
    error_response,
    generate_request_id,
    utc_now_iso,
    results_to_csv_string,
)

api = Blueprint("api", __name__)

# ──────────────────────────────────────────────────────────
# In-memory prediction history (session-scoped, resets on restart)
# ──────────────────────────────────────────────────────────
_prediction_history = []   # list of dicts
_MAX_HISTORY = 500


def _append_history(record: dict):
    """Append to history, evicting oldest entry if over limit."""
    global _prediction_history
    _prediction_history.append(record)
    if len(_prediction_history) > _MAX_HISTORY:
        _prediction_history = _prediction_history[-_MAX_HISTORY:]


# ──────────────────────────────────────────────────────────
# GET /health
# ──────────────────────────────────────────────────────────
@api.route("/health", methods=["GET"])
def health():
    """Liveness probe – also verifies the model is loaded."""
    try:
        model = get_model()
        return jsonify(success_response({
            "server": "online",
            "model_loaded": True,
            "model_features": model.n_features_in_,
            "uptime": utc_now_iso(),
        })), 200
    except Exception as e:
        return jsonify(error_response(str(e), 503)), 503


# ──────────────────────────────────────────────────────────
# GET /model-info
# ──────────────────────────────────────────────────────────
@api.route("/model-info", methods=["GET"])
def model_info():
    """Return model metadata including sorted feature importances."""
    try:
        info = get_model_info()
        return jsonify(success_response(info)), 200
    except Exception as e:
        return jsonify(error_response(str(e), 500)), 500


# ──────────────────────────────────────────────────────────
# GET /analytics
# ──────────────────────────────────────────────────────────
@api.route("/analytics", methods=["GET"])
def analytics():
    """Aggregate in-memory history into dashboard statistics."""
    try:
        history = _prediction_history
        total = len(history)
        threats = sum(1 for r in history if r.get("prediction") == 1)
        normal = total - threats
        threat_pct = round((threats / total * 100), 1) if total > 0 else 0

        # Risk level breakdown
        risk_breakdown = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        for r in history:
            lvl = r.get("risk_level", "Low")
            risk_breakdown[lvl] = risk_breakdown.get(lvl, 0) + 1

        # Recent 10 predictions for the dashboard table
        recent = history[-10:][::-1]

        # Average confidence
        avg_confidence = (
            round(sum(r.get("confidence", 0) for r in history) / total, 1)
            if total > 0 else 0
        )

        # Timeline: group by date (last 14 entries as stand-in)
        timeline = []
        for r in history[-30:]:
            timeline.append({
                "timestamp": r.get("timestamp", utc_now_iso()),
                "prediction": r.get("prediction", 0),
                "risk_level": r.get("risk_level", "Low"),
                "employee_id": r.get("employee_id", "Unknown"),
            })

        return jsonify(success_response({
            "total_predictions": total,
            "total_threats": threats,
            "total_normal": normal,
            "threat_percentage": threat_pct,
            "avg_confidence": avg_confidence,
            "risk_breakdown": risk_breakdown,
            "recent_predictions": recent,
            "timeline": timeline,
            "model_accuracy": 97.3,   # Reported from training evaluation
            "model_name": "Random Forest (n=300)",
        })), 200
    except Exception as e:
        return jsonify(error_response(str(e), 500)), 500


# ──────────────────────────────────────────────────────────
# POST /predict
# ──────────────────────────────────────────────────────────
@api.route("/predict", methods=["POST"])
def predict():
    """
    Single-record prediction.

    Body: JSON object with all 39 feature keys.
    Returns: Prediction, confidence, risk score, XAI explanation.
    """
    body = request.get_json(silent=True)
    if not body:
        return jsonify(error_response("Request body must be valid JSON.", 400)), 400

    try:
        result = run_single_prediction(body)
        req_id = generate_request_id()
        employee_id = body.get("employee_id", f"EMP-{req_id}")

        # Enrich with metadata
        result["request_id"] = req_id
        result["employee_id"] = employee_id
        result["timestamp"] = utc_now_iso()

        # Persist to session history
        _append_history({**result, "type": "single"})

        return jsonify(success_response(result, "Prediction complete.")), 200

    except ValueError as ve:
        errors = ve.args[0] if ve.args else str(ve)
        return jsonify(error_response(errors, 422)), 422
    except Exception as e:
        return jsonify(error_response(f"Internal server error: {e}", 500)), 500


# ──────────────────────────────────────────────────────────
# POST /predict-csv
# ──────────────────────────────────────────────────────────
@api.route("/predict-csv", methods=["POST"])
def predict_csv():
    """
    Batch prediction from uploaded CSV file.

    Form data key: 'file' (text/csv or application/octet-stream)
    Returns: List of per-row predictions.
    """
    if "file" not in request.files:
        return jsonify(error_response("No file uploaded. Use form-data key 'file'.", 400)), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify(error_response("Only CSV files are supported.", 415)), 415

    try:
        content = file.read().decode("utf-8")
        df = pd.read_csv(io.StringIO(content))

        if df.empty:
            return jsonify(error_response("The uploaded CSV is empty.", 400)), 400

        results = run_batch_prediction(df)

        # Persist each batch result to history
        for r in results:
            _append_history({**r, "type": "batch", "timestamp": utc_now_iso()})

        summary = {
            "total_rows": len(results),
            "threats_detected": sum(1 for r in results if r["prediction"] == 1),
            "normal_users": sum(1 for r in results if r["prediction"] == 0),
        }

        return jsonify(success_response({
            "summary": summary,
            "predictions": results,
        }, f"Batch prediction complete. {len(results)} records processed.")), 200

    except ValueError as ve:
        return jsonify(error_response(str(ve), 422)), 422
    except pd.errors.ParserError:
        return jsonify(error_response("Could not parse CSV. Ensure the file is valid.", 400)), 400
    except Exception as e:
        return jsonify(error_response(f"Internal server error: {e}", 500)), 500


# ──────────────────────────────────────────────────────────
# GET /predict-csv/download
# ──────────────────────────────────────────────────────────
@api.route("/history", methods=["GET"])
def get_history():
    """Return full in-session prediction history."""
    return jsonify(success_response({
        "count": len(_prediction_history),
        "history": _prediction_history[-100:][::-1],
    })), 200


# ──────────────────────────────────────────────────────────
# GET /feature-names
# ──────────────────────────────────────────────────────────
@api.route("/feature-names", methods=["GET"])
def feature_names():
    """Return the 39 expected feature names in order."""
    return jsonify(success_response({"features": FEATURE_NAMES, "count": len(FEATURE_NAMES)})), 200
