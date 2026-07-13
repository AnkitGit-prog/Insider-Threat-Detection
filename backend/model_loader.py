"""
model_loader.py
---------------
Singleton loader for the trained Random Forest model.
Loads once at startup to prevent redundant disk I/O.
"""

import os
import joblib
import logging

logger = logging.getLogger(__name__)

# Absolute path to the model file (relative to project root)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "best_random_forest.pkl")

_model = None  # Module-level singleton


def get_model():
    """
    Return the loaded RandomForestClassifier singleton.
    Loads from disk on first call; subsequent calls return cached instance.
    """
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "The pre-trained Random Forest model file (best_random_forest.pkl) is missing from the models/ directory. "
                "Please ensure the model file is added before starting the server."
            )
        logger.info(f"Loading model from {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
        logger.info(
            f"Model loaded: {type(_model).__name__} | "
            f"Features: {_model.n_features_in_} | "
            f"Estimators: {_model.n_estimators}"
        )
    return _model


def get_model_info():
    """Return a metadata dictionary about the loaded model."""
    model = get_model()
    params = model.get_params()
    feature_names = list(model.feature_names_in_) if hasattr(model, "feature_names_in_") else []
    importances = (
        dict(zip(feature_names, model.feature_importances_.tolist()))
        if feature_names else {}
    )
    # Sort by importance descending
    sorted_importances = dict(
        sorted(importances.items(), key=lambda x: x[1], reverse=True)
    )
    return {
        "model_type": "Random Forest Classifier",
        "status": "Production",
        "n_estimators": params.get("n_estimators", 300),
        "max_depth": params.get("max_depth"),
        "max_features": params.get("max_features", "sqrt"),
        "criterion": params.get("criterion", "gini"),
        "random_state": params.get("random_state", 42),
        "n_features": model.n_features_in_,
        "feature_names": feature_names,
        "feature_importances": sorted_importances,
        "classes": model.classes_.tolist(),
        "class_labels": {0: "Normal", 1: "Insider Threat"},
    }
