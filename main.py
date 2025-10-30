import os
import sys

# Make backend package (equipment-management-backend/src) importable
BASE = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(BASE, 'equipment-management-backend')
SRC_DIR = os.path.join(BACKEND_DIR, 'src')
for p in (BACKEND_DIR, SRC_DIR):
    ap = os.path.abspath(p)
    if ap not in sys.path:
        sys.path.insert(0, ap)

from flask import Flask, send_from_directory, request
from flask_cors import CORS
from src.models.equipment import db
from src.routes.equipment import equipment_bp

# Single Flask app; static serves the built frontend from JCDC/static
app = Flask(__name__, static_folder=os.path.join(BASE, 'static'), static_url_path='')

# Basic config
app.config['SECRET_KEY'] = 'change-me'
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI = r"sqlite:///C:\Users\naqed\Desktop\JCDC\equipment-management-backend\src\database\app.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS and register API routes first (before catch-all)
CORS(app)
app.register_blueprint(equipment_bp, url_prefix='/api')

# Initialize DB (create tables if missing)
db.init_app(app)
with app.app_context():
    os.makedirs(os.path.join(BASE, 'database'), exist_ok=True)
    db.create_all()

# SPA catch-all: serve built frontend and static assets
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path: str):
    # Serve real static files (e.g., /assets/*.js, /favicon.ico)
    candidate = os.path.join(app.static_folder, path)
    if path and os.path.isfile(candidate):
        return send_from_directory(app.static_folder, path)
    # Fallback to index.html for client-side routes (/equipment, /drivers, etc.)
    return send_from_directory(app.static_folder, 'index.html')

# Safety net: for any non-API 404, return index.html so React Router can handle it
@app.errorhandler(404)
def spa_fallback(e):
    # Let API 404s pass through unchanged
    if request.path.startswith('/api'):
        return e
    # If request looks like a real file (has an extension) and doesn't exist, keep 404
    candidate = os.path.join(app.static_folder, request.path.lstrip('/'))
    if os.path.splitext(candidate)[1] and not os.path.exists(candidate):
        return e
    # Otherwise serve index.html for SPA routes
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Print routes to verify catch-all is registered
    print("URL MAP:", app.url_map)
    app.run(debug=True, host='0.0.0.0', port=5000)