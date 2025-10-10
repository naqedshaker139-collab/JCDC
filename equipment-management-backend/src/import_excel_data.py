
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pandas as pd
from datetime import datetime
from src.models.equipment import db, Equipment, Driver, Request
from src.main import app

def parse_date(date_str):
    if pd.isna(date_str):
        return None
    if isinstance(date_str, datetime):
        return date_str.date()
    try:
        return datetime.strptime(str(date_str).split(" ")[0], "%d.%m.%Y").date()
    except ValueError:
        try:
            return datetime.strptime(str(date_str).split(" ")[0], "%Y-%m-%d").date()
        except ValueError:
            return None

def import_data_from_excel(excel_file_path):
    with app.app_context():
        db.drop_all()
        db.create_all()

        df = pd.read_excel(excel_file_path, header=3)
        df = df.where(pd.notna(df), None) # Replace NaN with None

        # Process Equipment and Drivers
        for index, row in df.iterrows():
            # Create or update Equipment
            # Use asset_no as the primary identifier for equipment
            equipment = Equipment.query.filter_by(asset_no=row["ASSET No."]).first()
            if not equipment:
                equipment = Equipment(
                    asset_no=row["ASSET No."],
                    equipment_name=row["Equipment"],
                    plate_serial_no=row["PLATE NO/SERIAL NO"],
                    shift_type=row["Shift"],
                    num_shifts_requested=row["No. of shifts as per the request"],
                    status=row["Status"],
                    zone_department=row["ZONE/DEPARTMENT"],
                    mobilized_date=parse_date(row["Mobilized Date"]),
                    demobilization_date=parse_date(row["DEMOBIZATION EXPECTED DATE"]),
                    company_supplier=row["Company/Supplier"],
                    remarks=row["Remarks"],
                )
                db.session.add(equipment)
            else:
                # Update existing equipment
                equipment.equipment_name = row["Equipment"]
                equipment.plate_serial_no = row["PLATE NO/SERIAL NO"]
                equipment.shift_type = row["Shift"]
                equipment.num_shifts_requested = row["No. of shifts as per the request"]
                equipment.status = row["Status"]
                equipment.zone_department = row["ZONE/DEPARTMENT"]
                equipment.mobilized_date = parse_date(row["Mobilized Date"])
                equipment.demobilization_date = parse_date(row["DEMOBIZATION EXPECTED DATE"])
                equipment.company_supplier = row["Company/Supplier"]
                equipment.remarks = row["Remarks"]
            
            db.session.commit() # Commit to get equipment_id if new, or update existing
            
            # Create or update Day Shift Driver
            if row["Day Shift"] and row["IQAMA No."] and row["Mobile No."]:
                day_driver = Driver.query.filter_by(eqama_number=str(row["IQAMA No."])).first()
                if not day_driver:
                    day_driver = Driver(
                        driver_name=row["Day Shift"],
                        phone_number=str(row["Mobile No."]),
                        eqama_number=str(row["IQAMA No."]),
                        day_shift_equipment_id=equipment.equipment_id
                    )
                    db.session.add(day_driver)
                else:
                    day_driver.driver_name = row["Day Shift"]
                    day_driver.phone_number = str(row["Mobile No."])
                    day_driver.day_shift_equipment_id = equipment.equipment_id

            # Create or update Night Shift Driver
            if row["Night Shift "] and row["IQAMA No"] and row["Mobile No"]:
                night_driver = Driver.query.filter_by(eqama_number=str(row["IQAMA No"])).first()
                if not night_driver:
                    night_driver = Driver(
                        driver_name=row["Night Shift "],
                        phone_number=str(row["Mobile No"]),
                        eqama_number=str(row["IQAMA No"]),
                        night_shift_equipment_id=equipment.equipment_id
                    )
                    db.session.add(night_driver)
                else:
                    night_driver.driver_name = row["Night Shift "]
                    night_driver.phone_number = str(row["Mobile No"])
                    night_driver.night_shift_equipment_id = equipment.equipment_id

            db.session.commit()

        print("Data imported successfully!")

if __name__ == '__main__':
    excel_file = "/home/ubuntu/upload/20250909EQUIPMENTSUMMARYREPORTOFJCDC-副本-副本.xlsx"
    import_data_from_excel(excel_file)


