from flask import Blueprint, request, jsonify
from src.models.equipment import db, Equipment, Driver, Request
from datetime import datetime

equipment_bp = Blueprint("equipment", __name__)

# Helper function to convert date strings to date objects
def parse_date(date_str):
    if date_str:
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            # Handle other date formats if necessary, or return None
            return None
    return None

# Equipment routes
@equipment_bp.route("/equipment", methods=["GET"])
def get_all_equipment():
    try:
        equipment_list = Equipment.query.all()
        enhanced_equipment_list = []
        
        for eq in equipment_list:
            equipment_data = eq.to_dict()
            
            # Add driver information for day shift
            day_driver = Driver.query.filter_by(day_shift_equipment_id=eq.equipment_id).first()
            if day_driver:
                equipment_data["day_shift_driver_name"] = day_driver.driver_name
                equipment_data["day_shift_driver_phone"] = day_driver.phone_number
            else:
                equipment_data["day_shift_driver_name"] = None
                equipment_data["day_shift_driver_phone"] = None
            
            # Add driver information for night shift
            night_driver = Driver.query.filter_by(night_shift_equipment_id=eq.equipment_id).first()
            if night_driver:
                equipment_data["night_shift_driver_name"] = night_driver.driver_name
                equipment_data["night_shift_driver_phone"] = night_driver.phone_number
            else:
                equipment_data["night_shift_driver_name"] = None
                equipment_data["night_shift_driver_phone"] = None
            
            enhanced_equipment_list.append(equipment_data)
        
        return jsonify(enhanced_equipment_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@equipment_bp.route("/equipment", methods=["POST"])
def add_equipment():
    try:
        data = request.get_json()

        new_equipment = Equipment(
            asset_no=data["asset_no"],
            equipment_name=data["equipment_name"],
            plate_serial_no=data["plate_serial_no"],
            shift_type=data["shift_type"],
            num_shifts_requested=data.get("num_shifts_requested"),
            status=data.get("status", "Available"),
            zone_department=data.get("zone_department"),
            mobilized_date=parse_date(data.get("mobilized_date")),
            demobilization_date=parse_date(data.get("demobilization_date")),
            company_supplier=data.get("company_supplier"),
            remarks=data.get("remarks"),
        )

        db.session.add(new_equipment)
        db.session.commit()

        return jsonify(new_equipment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@equipment_bp.route("/equipment/<int:equipment_id>", methods=["PUT"])
def update_equipment(equipment_id):
    try:
        equipment = Equipment.query.get_or_404(equipment_id)
        data = request.get_json()

        equipment.asset_no = data.get("asset_no", equipment.asset_no)
        equipment.equipment_name = data.get("equipment_name", equipment.equipment_name)
        equipment.plate_serial_no = data.get("plate_serial_no", equipment.plate_serial_no)
        equipment.shift_type = data.get("shift_type", equipment.shift_type)
        equipment.num_shifts_requested = data.get("num_shifts_requested", equipment.num_shifts_requested)
        equipment.status = data.get("status", equipment.status)
        equipment.zone_department = data.get("zone_department", equipment.zone_department)
        equipment.mobilized_date = parse_date(data.get("mobilized_date")) or equipment.mobilized_date
        equipment.demobilization_date = parse_date(data.get("demobilization_date")) or equipment.demobilization_date
        equipment.company_supplier = data.get("company_supplier", equipment.company_supplier)
        equipment.remarks = data.get("remarks", equipment.remarks)

        db.session.commit()
        return jsonify(equipment.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Driver routes
@equipment_bp.route("/drivers", methods=["GET"])
def get_all_drivers():
    try:
        drivers = Driver.query.all()
        driver_list = []
        for driver in drivers:
            driver_data = driver.to_dict()
            if driver.day_shift_equipment_id:
                day_eq = Equipment.query.get(driver.day_shift_equipment_id)
                driver_data["day_shift_equipment_name"] = day_eq.equipment_name if day_eq else None
                driver_data["day_shift_machine_number"] = day_eq.plate_serial_no if day_eq else None
            else:
                driver_data["day_shift_equipment_name"] = None
                driver_data["day_shift_machine_number"] = None
            
            if driver.night_shift_equipment_id:
                night_eq = Equipment.query.get(driver.night_shift_equipment_id)
                driver_data["night_shift_equipment_name"] = night_eq.equipment_name if night_eq else None
                driver_data["night_shift_machine_number"] = night_eq.plate_serial_no if night_eq else None
            else:
                driver_data["night_shift_equipment_name"] = None
                driver_data["night_shift_machine_number"] = None
            
            driver_list.append(driver_data)
        return jsonify(driver_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@equipment_bp.route("/drivers", methods=["POST"])
def add_driver():
    try:
        data = request.get_json()

        new_driver = Driver(
            driver_name=data["driver_name"],
            phone_number=data["phone_number"],
            eqama_number=data["eqama_number"],
            day_shift_equipment_id=data.get("day_shift_equipment_id"),
            night_shift_equipment_id=data.get("night_shift_equipment_id"),
        )

        db.session.add(new_driver)
        db.session.commit()

        return jsonify(new_driver.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Request routes
@equipment_bp.route("/requests", methods=["GET"])
def get_all_requests():
    try:
        requests = Request.query.order_by(Request.request_time.desc()).all()
        request_list = []
        for req in requests:
            request_data = req.to_dict()
            equipment = Equipment.query.get(req.requested_equipment)
            request_data["equipment_name"] = equipment.equipment_name if equipment else None
            request_data["machine_number"] = equipment.plate_serial_no if equipment else None
            request_list.append(request_data)
        return jsonify(request_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@equipment_bp.route("/requests", methods=["POST"])
def create_request():
    try:
        data = request.get_json()

        new_request = Request(
            engineer_name=data["engineer_name"],
            requested_equipment=data["requested_equipment"],
            notes=data.get("notes", ""),
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify(new_request.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@equipment_bp.route("/requests/<int:request_id>", methods=["PUT"])
def update_request_status(request_id):
    try:
        req = Request.query.get_or_404(request_id)
        data = request.get_json()

        req.status = data.get("status", req.status)

        db.session.commit()
        return jsonify(req.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Dashboard stats
@equipment_bp.route("/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    try:
        total_equipment = Equipment.query.count()
        available_equipment = Equipment.query.filter_by(status="Active").count()
        total_drivers = Driver.query.count()
        pending_requests = Request.query.filter_by(status="Pending").count()

        return jsonify(
            {
                "total_equipment": total_equipment,
                "available_equipment": available_equipment,
                "total_drivers": total_drivers,
                "pending_requests": pending_requests,
            }
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

