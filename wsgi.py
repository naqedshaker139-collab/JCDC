# In backend/wsgi.py

from src.main import app
from src.seed_data import seed_data

# --- ADD THIS CODE BLOCK ---
with app.app_context():
    seed_data()
# ---------------------------

if __name__ == "__main__":
    app.run()
