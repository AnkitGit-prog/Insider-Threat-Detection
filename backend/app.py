"""
app.py
------
Flask application entry point.

Run:
    python app.py          (development)
    flask run --port 5000  (alternative)
"""

import logging
from flask import Flask
from flask_cors import CORS

from routes import api


def create_app() -> Flask:
    app = Flask(__name__)

    # Allow cross-origin requests from the Vite dev server (port 5173)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

    # Register all API routes under the /api prefix
    app.register_blueprint(api, url_prefix="/api")

    # ── Logging ──────────────────────────────────────────
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    )

    @app.errorhandler(404)
    def not_found(_):
        return {"status": "error", "message": "Endpoint not found."}, 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return {"status": "error", "message": "Method not allowed."}, 405

    @app.errorhandler(500)
    def internal_error(e):
        return {"status": "error", "message": f"Internal server error: {e}"}, 500

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n" + "=" * 60)
    print("  Insider Threat Detection API")
    print("  Running at: http://localhost:5000")
    print("  API prefix: /api")
    print("=" * 60 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
