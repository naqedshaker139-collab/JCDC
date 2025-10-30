import os
import sys
from datetime import datetime

# Ensure backend modules are importable (equipment-management-backend/src)
BASE = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(BASE, 'equipment-management-backend')
SRC_DIR = os.path.join(BACKEND_DIR, 'src')
for p in (BACKEND_DIR, SRC_DIR):
    ap = os.path.abspath(p)
    if ap not in sys.path:
        sys.path.insert(0, ap)

import pandas as pd
from main import app  # Use the same Flask app and engine as the backend
from src.models.equipment import db, Equipment, Driver  # ORM bound to app at import time


def parse_date(date_str):
    if pd.isna(date_str) or date_str in (None, ""):
        return None
    if isinstance(date_str, datetime):
        try:
            return date_str.date()
        except Exception:
            return None
    s = str(date_str).split(" ")[0]
    for fmt in ("%d.%m.%Y", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _norm_header(s: str) -> str:
    # Normalize header names: lowercase, strip NBSP/RTL, collapse/remove spaces
    s = str(s).replace("\xa0", " ").replace("\u200f", "")
    s = " ".join(s.strip().split())  # collapse inner spaces to one
    s = s.lower().replace(" ", "")   # remove spaces entirely
    return s


def _load_and_normalize_dataframe(excel_file_path: str) -> pd.DataFrame:
    print("Loading Excel file:", excel_file_path)
    tried = []
    core_hints = {"asset", "equipment", "plate", "serial", "zone", "department", "shift"}
    # 1) Try common header rows first
    for hdr in (3, 2, 1, 0):
        try:
            df = pd.read_excel(excel_file_path, header=hdr)
            print("Original columns:", list(df.columns))
            norm_cols = [_norm_header(c) for c in df.columns]
            df.columns = norm_cols
            df = df.where(pd.notna(df), None)
            print("Normalized columns:", norm_cols)
            joined = " ".join(norm_cols)
            if sum(1 for h in core_hints if h in joined) >= 2:
                return df
            tried.append((hdr, "headers not matching expected hints"))
        except Exception as e:
            tried.append((hdr, str(e)))
    # 2) Fallback: scan first 20 rows to find a good header row
    try:
        raw = pd.read_excel(excel_file_path, header=None)
        for i in range(min(20, len(raw))):
            row_vals = [str(x) if x is not None else "" for x in list(raw.iloc[i].values)]
            norm_row = [_norm_header(c) for c in row_vals]
            joined = " ".join(norm_row)
            if sum(1 for h in core_hints if h in joined) >= 2:
                df = pd.read_excel(excel_file_path, header=i)
                print(f"Detected header row at index {i}")
                print("Original columns:", list(df.columns))
                df.columns = [_norm_header(c) for c in df.columns]
                df = df.where(pd.notna(df), None)
                print("Normalized columns:", list(df.columns))
                return df
        print("No suitable header row detected; using first row as header")
        df = pd.read_excel(excel_file_path, header=0)
        print("Original columns:", list(df.columns))
        df.columns = [_norm_header(c) for c in df.columns]
        df = df.where(pd.notna(df), None)
        print("Normalized columns:", list(df.columns))
        return df
    except Exception as e:
        print("Fallback header scan failed:", e)
        df = pd.read_excel(excel_file_path)
        print("Original columns:", list(df.columns))
        df.columns = [_norm_header(c) for c in df.columns]
        df = df.where(pd.notna(df), None)
        print("Normalized columns:", list(df.columns))
        return df


def _apply_rename_map(df: pd.DataFrame) -> pd.DataFrame:
    # Map your sheet’s normalized names to canonical fields
    rename_map = {
        # equipment core
        "assetno.": "asset_no",
        "assetno": "asset_no",
        "equipment": "equipment_name",
        "equipments": "equipment_name",
        "plateno/serialno": "plate_serial_no",
        "plateno": "plate_serial_no",
        "serialno": "plate_serial_no",
        "plate no/serial no": "plate_serial_no",
        "shift": "shift_type",
        "no.ofshiftsaspertherequest": "num_shifts_requested",
        "noofshiftsaspertherequest": "num_shifts_requested",
        "status": "status",
        "equipmentstatus": "status",
        "zone/department": "zone_department",
        "department": "zone_department",
        "mobilizeddate": "mobilized_date",
        "mobilized": "mobilized_date",
        "mobilisationdate": "mobilized_date",
        "demobizationexpecteddate": "demobilization_date",  # misspelling in sheet
        "demobilizationexpecteddate": "demobilization_date",
        "demobilizationdate": "demobilization_date",
        "company/supplier": "company_supplier",
        "supplier": "company_supplier",
        "remarks": "remarks",
        # drivers (day)
        "dayshift": "day_shift_driver_name",
        "iqamano.": "day_iqama",
        "mobileno.": "day_phone",
        # drivers (night)
        "nightshift": "night_shift_driver_name",
        "iqamano": "night_iqama",
        "mobileno": "night_phone",
    }
    present = {k: v for k, v in rename_map.items() if k in df.columns}
    df = df.rename(columns=present)

    # Deduplicate columns after rename: merge duplicates by taking first non-null across duplicates
    if getattr(df.columns, "duplicated", None) is not None and df.columns.duplicated().any():
        cols = df.columns
        for col in set(cols[cols.duplicated(keep="first")]):
            dupes = df.loc[:, cols == col]
            merged = dupes.bfill(axis=1).iloc[:, 0]
            df[col] = merged
        df = df.loc[:, ~df.columns.duplicated(keep="first")]

    return df


def _val(row, *keys):
    import pandas as pd  # local import to avoid top-level dependency during edits
    for k in keys:
        if k in row:
            val = row[k]
            # If duplicates existed before dedup, val can be a Series; take first non-empty
            if isinstance(val, pd.Series):
                for x in val:
                    if x not in (None, ""):
                        return x
                continue
            if val not in (None, ""):
                return val
    return None


def import_data_from_excel(excel_file_path: str):
    print("Excel file path used:", excel_file_path)
    print("App config URI:", app.config.get("SQLALCHEMY_DATABASE_URI"))
    with app.app_context():
        print("Engine URL:", db.engine.url)
        print("Engine DB file:", db.engine.url.database)

        if not os.path.exists(excel_file_path):
            raise FileNotFoundError(f"Path not found: {excel_file_path}")

        # Reset tables then import
        db.drop_all()
        db.create_all()

        df = _load_and_normalize_dataframe(excel_file_path)
        df = _apply_rename_map(df)

        # Diagnostics
        print("Final columns after rename:", list(df.columns))
        nonnull_asset = int(pd.Series(df.get("asset_no")).notna().sum()) if "asset_no" in df.columns else 0
        nonnull_plate = int(pd.Series(df.get("plate_serial_no")).notna().sum()) if "plate_serial_no" in df.columns else 0
        print(f"Non-empty asset_no rows: {nonnull_asset}, non-empty plate_serial_no rows: {nonnull_plate}")

        # Helper to derive status from date-specific columns like 'status2025/9/20'
        status_cols = [c for c in df.columns if str(c).startswith("status")]

        def _derive_status(row):
            for col in reversed(status_cols):
                val = row.get(col)
                if val not in (None, ""):
                    return val
            return None

        inserted_eq = 0
        inserted_dr = 0

        def _clean_shift(v):
            # ensure non-null string for NOT NULL constraint
            if v in (None, ""):
                return ""
            return str(v)

        def _clean_int(v):
            try:
                if v is None or (isinstance(v, float) and pd.isna(v)):
                    return None
                return int(v)
            except Exception:
                return None

        for _, row in df.iterrows():
            asset_no = _val(row, "asset_no")
            plate_no = _val(row, "plate_serial_no")

            # skip rows without identifiers
            if not asset_no and not plate_no:
                continue

            status_value = _val(row, "status") or _derive_status(row)
            shift_value = _clean_shift(_val(row, "shift_type"))
            shifts_requested = _clean_int(_val(row, "num_shifts_requested"))

            # Upsert Equipment: prefer asset_no, fallback to plate_serial_no
            equipment = None
            if asset_no:
                equipment = Equipment.query.filter_by(asset_no=asset_no).first()
            if equipment is None and plate_no:
                equipment = Equipment.query.filter_by(plate_serial_no=plate_no).first()

            if not equipment:
                equipment = Equipment(
                    asset_no=asset_no,
                    equipment_name=_val(row, "equipment_name"),
                    plate_serial_no=plate_no,
                    shift_type=shift_value,  # never None
                    num_shifts_requested=shifts_requested,
                    status=status_value,
                    zone_department=_val(row, "zone_department"),
                    mobilized_date=parse_date(_val(row, "mobilized_date")),
                    demobilization_date=parse_date(_val(row, "demobilization_date")),
                    company_supplier=_val(row, "company_supplier"),
                    remarks=_val(row, "remarks"),
                )
                db.session.add(equipment)
                inserted_eq += 1
            else:
                equipment.equipment_name = _val(row, "equipment_name")
                equipment.plate_serial_no = plate_no or equipment.plate_serial_no
                # only overwrite shift if we have a value; always keep non-null
                if shift_value != "":
                    equipment.shift_type = shift_value
                elif not equipment.shift_type:
                    equipment.shift_type = ""
                equipment.num_shifts_requested = shifts_requested
                equipment.status = status_value
                equipment.zone_department = _val(row, "zone_department")
                equipment.mobilized_date = parse_date(_val(row, "mobilized_date"))
                equipment.demobilization_date = parse_date(_val(row, "demobilization_date"))
                equipment.company_supplier = _val(row, "company_supplier")
                equipment.remarks = _val(row, "remarks")

            db.session.commit()  # ensure equipment_id available

            # Day driver
            if _val(row, "day_shift_driver_name") and (_val(row, "day_iqama") or _val(row, "day_phone")):
                eqama = str(_val(row, "day_iqama") or "")
                day_driver = Driver.query.filter_by(eqama_number=eqama).first()
                if not day_driver:
                    day_driver = Driver(
                        driver_name=_val(row, "day_shift_driver_name"),
                        phone_number=str(_val(row, "day_phone") or ""),
                        eqama_number=eqama,
                        day_shift_equipment_id=equipment.equipment_id,
                    )
                    db.session.add(day_driver)
                    inserted_dr += 1
                else:
                    day_driver.driver_name = _val(row, "day_shift_driver_name")
                    day_driver.phone_number = str(_val(row, "day_phone") or "")
                    day_driver.day_shift_equipment_id = equipment.equipment_id

            # Night driver
            if _val(row, "night_shift_driver_name") and (_val(row, "night_iqama") or _val(row, "night_phone")):
                eqama_n = str(_val(row, "night_iqama") or "")
                night_driver = Driver.query.filter_by(eqama_number=eqama_n).first()
                if not night_driver:
                    night_driver = Driver(
                        driver_name=_val(row, "night_shift_driver_name"),
                        phone_number=str(_val(row, "night_phone") or ""),
                        eqama_number=eqama_n,
                        night_shift_equipment_id=equipment.equipment_id,
                    )
                    db.session.add(night_driver)
                    inserted_dr += 1
                else:
                    night_driver.driver_name = _val(row, "night_shift_driver_name")
                    night_driver.phone_number = str(_val(row, "night_phone") or "")
                    night_driver.night_shift_equipment_id = equipment.equipment_id

            db.session.commit()

        print(f"Inserted/updated Equipment rows: {inserted_eq}")
        print(f"Inserted Drivers rows: {inserted_dr}")
        print("✅ Import completed successfully.")


if __name__ == "__main__":
    excel_file = sys.argv[1] if len(sys.argv) > 1 else ""
    if not excel_file:
        raise SystemExit("Please provide the Excel file path, e.g.: python import_excel_data.py path\\to\\file.xlsx")
    import_data_from_excel(excel_file)