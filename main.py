import os
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from flask import Flask, send_from_directory, request
from flask_cors import CORS

BASE = Path(file).resolve().parent

BACKEND_DIR = BASE / 'equipment-management-backend'
SRC_DIR = BACKEND_DIR / 'src'
for p in (BACKEND_DIR, SRC_DIR):
ap = str(p.resolve())
if p.exists() and ap not in sys.path:
sys.path.insert(0, ap)

ZIPPED_BACKEND = BASE / 'equipment-management-backend.zip'
if ZIPPED_BACKEND.exists():
zp = str(ZIPPED_BACKEND.resolve())
if zp not in sys.path:
sys.path.insert(0, zp)

from src.models.equipment import db
from src.routes.equipment import equipment_bp


app = Flask(name, static_folder=str(BASE / 'static'), static_url_path='')

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-insecure-key')

 
def _normalize_pg8000_url(url: str) -> str:
try:
u = urlparse(url)
if (u.scheme or "").startswith("postgresql+pg8000"):
# Replace sslmode=require with ssl=true for pg8000
q = dict(parse_qsl(u.query, keep_blank_values=True))
if "sslmode" in q:
q.pop("sslmode", None)
q.setdefault("ssl", "true")
new_query = urlencode(q)
return urlunparse((u.scheme, u.netloc, u.path, u.params, new_query, u.fragment))
except Exception:
pass
return url

 
db_url = os.getenv('DATABASE_URL')
if db_url:
db_url = _normalize_pg8000_url(db_url)

if not db_url:
# Local fallback (keep your previous local SQLite path)
default_sqlite = (BACKEND_DIR / 'src' / 'database' / 'app.db').resolve()
default_sqlite.parent.mkdir(parents=True, exist_ok=True)
db_url = f"sqlite:///{default_sqlite}"

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


if db_url.startswith("postgresql+pg8000://") and "ssl=" not in db_url:
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"connect_args": {"ssl": True}}

print("DB URI:", app.config['SQLALCHEMY_DATABASE_URI'])


CORS(app) # adjust origins later if hosting frontend on a different domain
app.register_blueprint(equipment_bp, url_prefix='/api')

db.init_app(app)
with app.app_context():
# Keep legacy local database folder around if fallback is ever used
(BASE / 'database').mkdir(parents=True, exist_ok=True)
db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/')
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

 
if name == 'main':
print("URL MAP:", app.url_map)
app.run(debug=True, host='0.0.0.0', port=5000)

