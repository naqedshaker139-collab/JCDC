# In backend/wsgi.py

from src.main import app
from src.seed_data import seed_database # Import the function

# --- ADDED: Call the seeding function before the app starts ---
# This ensures the database is populated every time the service wakes up
with app.app_context():
    seed_database()
# -------------------------------------------------------------

if __name__ == "__main__":
    app.run()
