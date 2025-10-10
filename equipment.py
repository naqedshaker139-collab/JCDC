from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Equipment(db.Model):
    __tablename__ = 'equipment'
    
    equipment_id = db.Column(db.Integer, primary_key=True)
    asset_no = db.Column(db.String(50), unique=True, nullable=False)
    equipment_name = db.Column(db.String(100), nullable=False)
    plate_serial_no = db.Column(db.String(100), nullable=False) # Removed unique=True
    shift_type = db.Column(db.String(50), nullable=False) # e.g., 'Day & Night', 'Day', 'Night'
    num_shifts_requested = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), default='Available')
    zone_department = db.Column(db.String(100), nullable=True)
    mobilized_date = db.Column(db.Date, nullable=True)
    demobilization_date = db.Column(db.Date, nullable=True)
    company_supplier = db.Column(db.String(100), nullable=True)
    remarks = db.Column(db.String(255), nullable=True)
    
    # Relationships
    day_shift_driver = db.relationship('Driver', foreign_keys='Driver.day_shift_equipment_id', backref='day_shift_assigned_equipment', lazy=True, uselist=False)
    night_shift_driver = db.relationship('Driver', foreign_keys='Driver.night_shift_equipment_id', backref='night_shift_assigned_equipment', lazy=True, uselist=False)
    requests = db.relationship('Request', backref='equipment_details', lazy=True)
    
    def to_dict(self):
        return {
            'equipment_id': self.equipment_id,
            'asset_no': self.asset_no,
            'equipment_name': self.equipment_name,
            'plate_serial_no': self.plate_serial_no,
            'shift_type': self.shift_type,
            'num_shifts_requested': self.num_shifts_requested,
            'status': self.status,
            'zone_department': self.zone_department,
            'mobilized_date': self.mobilized_date.isoformat() if self.mobilized_date else None,
            'demobilization_date': self.demobilization_date.isoformat() if self.demobilization_date else None,
            'company_supplier': self.company_supplier,
            'remarks': self.remarks
        }

class Driver(db.Model):
    __tablename__ = 'drivers'
    
    driver_id = db.Column(db.Integer, primary_key=True)
    driver_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    eqama_number = db.Column(db.String(20), unique=True, nullable=False)
    
    # Foreign keys for assigned equipment based on shift
    day_shift_equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.equipment_id'), nullable=True)
    night_shift_equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.equipment_id'), nullable=True)
    
    def to_dict(self):
        return {
            'driver_id': self.driver_id,
            'driver_name': self.driver_name,
            'phone_number': self.phone_number,
            'eqama_number': self.eqama_number,
            'day_shift_equipment_id': self.day_shift_equipment_id,
            'night_shift_equipment_id': self.night_shift_equipment_id
        }

class Request(db.Model):
    __tablename__ = 'requests'
    
    request_id = db.Column(db.Integer, primary_key=True)
    engineer_name = db.Column(db.String(100), nullable=False)
    requested_equipment = db.Column(db.Integer, db.ForeignKey('equipment.equipment_id'), nullable=False)
    request_time = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Pending')
    notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'request_id': self.request_id,
            'engineer_name': self.engineer_name,
            'requested_equipment': self.requested_equipment,
            'request_time': self.request_time.isoformat() if self.request_time else None,
            'status': self.status,
            'notes': self.notes
        }

