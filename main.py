import os
import sys
from pathlib import Path

from flask import Flask, send_from_directory, request
from flask_cors import CORS

Make backend package (equipment-management-backend/src) importable
BASE = Path(file).resolve().parent
BACKEND_DIR = BASE / 'equipment-management-backend'
SRC_DIR = BACKEND_DIR / 'src'
for p in (BACKEND_DIR, SRC_DIR):
    ap = str(p.resolve())
    if ap not in sys.path:
        sys.path.insert(0, ap)

from src.models.equipment import db
from src.routes.equipment import equipment_bp

Single Flask app; static serves the built frontend from JCDC/static
app = Flask(name, static_folder=str(BASE / 'static'), static_url_path='')

#-----------------------------------------------------------------------------
#Config: SECRET_KEY and DATABASE_URL with local SQLite fallback
#-----------------------------------------------------------------------------
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-insecure-key')

Prefer DATABASE_URL (e.g., Neon Postgres). Fallback to your local SQLite path for dev.
db_url = os.getenv('DATABASE_URL')
if not db_url:
    # Keep your previous local path as the default fallback for compatibility
    default_sqlite = BACKEND_DIR / 'src' / 'database' / 'app.db'
    default_sqlite.parent.mkdir(parents=True, exist_ok=True)
    db_url = f"sqlite:///{default_sqlite}"

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

Optional: print once on startup to verify which DB is used (shows in Render logs)
print("DB URI:", app.config['SQLALCHEMY_DATABASE_URI'])

#-----------------------------------------------------------------------------
#CORS, Blueprints, and DB init
#-----------------------------------------------------------------------------
CORS(app) # adjust origins later if hosting frontend on a different domain
app.register_blueprint(equipment_bp, url_prefix='/api')

db.init_app(app)
with app.app_context():
    # Ensure the fallback BASE/database path exists if you ever switch to it
    (BASE / 'database').mkdir(parents=True, exist_ok=True)
    db.create_all()

#-----------------------------------------------------------------------------
#SPA catch-all: serve built frontend and static assets
#-----------------------------------------------------------------------------
@app.route('/', defaults={'path': ''})
@app.route('/')
def serve(path: str):
    # Serve real static files (e.g., /assets/*.js, /favicon.ico)
    candidate = (Path(app.static_folder) / path)
    if path and candidate.is_file():
        return send_from_directory(app.static_folder, path)
    # Fallback to index.html for client-side routes (/equipment, /drivers, etc.)
    return send_from_directory(app.static_folder, 'index.html')

Safety net: for any non-API 404, return index.html so React Router can handle it
@app.errorhandler(404)
def spa_fallback(e):
    # Let API 404s pass through unchanged
    if request.path.startswith('/api'):
        return e
    # If request looks like a real file (has an extension) and doesn't exist, keep 404
    candidate = Path(app.static_folder) / request.path.lstrip('/')
    if candidate.suffix and not candidate.exists():
        return e
    # Otherwise serve index.html for SPA routes
    return send_from_directory(app.static_folder, 'index.html')

if name == 'main':
    # Print routes to verify catch-all is registered
    print("URL MAP:", app.url_map)
    app.run(debug=True, host='0.0.0.0', port=5000)
