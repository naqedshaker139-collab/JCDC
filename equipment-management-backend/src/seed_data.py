# In backend/src/seed_data.py

import os
import sys
import pandas as pd
from datetime import datetime

# Adjust path to import from the correct location
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.equipment import db, Equipment, Driver, Request
from src.main import app

# --- ADDED: Define the path to your Excel file ---
# Since the Excel file is in the root of the 'backend' folder in your repo, 
# and this script is in 'backend/src', the path is '../20250909EQUIPMENTSUMMARYREPORTOFJCDC-副本-副本.xlsx'
EXCEL_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), '20250909EQUIPMENTSUMMARYREPORTOFJCDC-副本-副本.xlsx')
# --------------------------------------------------

def seed_database():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("Database schema created successfully.")
        
        # --- ADDED: Data Import Logic ---
        try:
            print(f"Attempting to read Excel file from: {EXCEL_FILE_PATH}")
            df = pd.read_excel(EXCEL_FILE_PATH, sheet_name='Equipment List')
            
            # Assuming your DataFrame columns match your Equipment model fields
            # You may need to adjust column names and data types based on your actual Excel file
            for index, row in df.iterrows():
                equipment = Equipment(
                    # Example mapping - adjust these to match your actual Excel columns
                    name=row['Equipment Name'],
                    category=row['Category'],
                    serial_number=row['Serial Number'],
                    status='Available', # Default status
                    last_maintenance=datetime.now() # Example date
                )
                db.session.add(equipment)
            
            db.session.commit()
            print(f"Successfully imported {len(df)} equipment records.")
            
        except FileNotFoundError:
            print(f"ERROR: Excel file not found at {EXCEL_FILE_PATH}. No data imported.")
        except Exception as e:
            db.session.rollback()
            print(f"An error occurred during data import: {e}")
        # ----------------------------------

if __name__ == '__main__':
    seed_database()
