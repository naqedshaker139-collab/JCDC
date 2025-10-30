import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.equipment import db
from src.routes.equipment import equipment_bp

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Initialize Flask app
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Use environment variable for secret key (fallback for local dev)
app.secret_key = os.environ.get("SECRET_KEY", "dev-insecure-key")

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(equipment_bp, url_prefix='/api')

# Configure database (example: SQLite; could be replaced by env var later)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    r"sqlite:///C:\Users\naqed\Desktop\JCDC\equipment-management-backend\src\database\app.db"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)
with app.app_context():
    db.create_all()

# Serve frontend (React/Vue/etc.)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


# Only run the app manually in local dev (Render uses Gunicorn)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
