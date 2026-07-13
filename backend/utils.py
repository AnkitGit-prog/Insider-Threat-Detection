"""
utils.py
--------
Shared utility helpers for the Flask backend.
"""

import uuid
import datetime
import io
import csv


def generate_request_id() -> str:
    """Create a short unique ID for each prediction request."""
    return str(uuid.uuid4())[:8].upper()


def utc_now_iso() -> str:
    """Return current UTC timestamp in ISO-8601 format."""
    return datetime.datetime.utcnow().isoformat() + "Z"


def success_response(data: dict, message: str = "Success") -> dict:
    """Standard success envelope."""
    return {
        "status": "success",
        "message": message,
        "timestamp": utc_now_iso(),
        "data": data,
    }


def error_response(message, code: int = 400) -> dict:
    """Standard error envelope."""
    if isinstance(message, list):
        msg = "; ".join(message)
    else:
        msg = str(message)
    return {
        "status": "error",
        "message": msg,
        "timestamp": utc_now_iso(),
        "code": code,
    }


def results_to_csv_string(results: list) -> str:
    """Convert batch prediction results to a CSV string for download."""
    if not results:
        return ""
    output = io.StringIO()
    # Flatten top_contributing_features to a comma-separated string
    fieldnames = [
        "row_index", "employee_id", "label", "prediction",
        "risk_level", "risk_score", "confidence",
        "probability_normal", "probability_threat",
        "top_features",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for r in results:
        top = ", ".join(f["label"] for f in r.get("top_contributing_features", [])[:3])
        writer.writerow({
            "row_index": r["row_index"],
            "employee_id": r["employee_id"],
            "label": r["label"],
            "prediction": r["prediction"],
            "risk_level": r["risk_level"],
            "risk_score": r["risk_score"],
            "confidence": r["confidence"],
            "probability_normal": r["probability_normal"],
            "probability_threat": r["probability_threat"],
            "top_features": top,
        })
    return output.getvalue()
