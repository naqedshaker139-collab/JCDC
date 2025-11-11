import os
import sys
from pathlib import Path
from flask import Flask, send_from_directory, request
from flask_cors import CORS

# Make backend package (equipment-management-backend/src) importable
BASE = Path(__file__).resolve().parent
BACKEND_DIR = BASE / 'equipment-management-backend'
SRC_DIR = BACKEND_DIR / 'src'
for p in (BACKEND_DIR, SRC_DIR):
    ap = str(p.resolve())
    if ap not in sys.path:
        sys.path.insert(0, ap)

from src.models.equipment import db
from src.routes.equipment import equipment_bp

# Single Flask app; static serves the built frontend from JCDC/static
app = Flask(__name__, static_folder=str(BASE / 'static'), static_url_path='')

# Config: SECRET_KEY and DATABASE_URL with local SQLite fallback
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-insecure-key')

db_url = os.getenv('DATABASE_URL')
if not db_url:
    default_sqlite = BACKEND_DIR / 'src' / 'database' / 'app.db'
    default_sqlite.parent.mkdir(parents=True, exist_ok=True)
    db_url = f"sqlite:///{default_sqlite}"

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print("DB URI:", app.config['SQLALCHEMY_DATABASE_URI'])

# CORS, Blueprints, and DB init
CORS(app)
app.register_blueprint(equipment_bp, url_prefix='/api')

db.init_app(app)
with app.app_context():
    (BASE / 'database').mkdir(parents=True, exist_ok=True)
    db.create_all()

# SPA catch-all: serve built frontend and static assets
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path: str):
    candidate = (Path(app.static_folder) / path)
    if path and candidate.is_file():
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def spa_fallback(e):
    if request.path.startswith('/api'):
        return e
    candidate = Path(app.static_folder) / request.path.lstrip('/')
    if candidate.suffix and not candidate.exists():
        return e
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("URL MAP:", app.url_map)
    app.run(debug=True, host='0.0.0.0', port=5000)
