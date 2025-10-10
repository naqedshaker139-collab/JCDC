import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.equipment import db, Equipment, Driver, Request
from src.main import app

def seed_database():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("Database schema created successfully. Ready for data import.")

if __name__ == '__main__':
    seed_database()


