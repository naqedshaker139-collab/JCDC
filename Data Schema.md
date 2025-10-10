# Data Schema

This document outlines the data schema for the equipment management website. It defines the structure of the database tables that will store information about equipment, drivers, and requests.

## 1. Equipment Table

This table stores information about each piece of equipment.

| Column Name           | Data Type | Description                                       |
| --------------------- | --------- | ------------------------------------------------- |
| `equipment_id`        | INTEGER   | Unique identifier for the equipment (Primary Key) |
| `asset_no`            | TEXT      | Asset number of the equipment (Unique)            |
| `equipment_name`      | TEXT      | Name of the equipment (e.g., "Excavator")       |
| `plate_serial_no`     | TEXT      | Plate number or serial number (Unique)            |
| `shift_type`          | TEXT      | Shift type (e.g., "Day & Night", "Day", "Night") |
| `num_shifts_requested`| INTEGER   | Number of shifts as per request                   |
| `status`              | TEXT      | Current status of the equipment (e.g., "Available") |
| `zone_department`     | TEXT      | Zone or department where equipment is located     |
| `mobilized_date`      | DATE      | Date when equipment was mobilized                 |
| `demobilization_date` | DATE      | Expected demobilization date                      |
| `company_supplier`    | TEXT      | Company or supplier of the equipment              |
| `remarks`             | TEXT      | Any additional remarks                            |

## 2. Drivers Table

This table stores information about each driver or operator.

| Column Name              | Data Type | Description                                         |
| ------------------------ | --------- | --------------------------------------------------- |
| `driver_id`              | INTEGER   | Unique identifier for the driver (Primary Key)      |
| `driver_name`            | TEXT      | Full name of the driver                             |
| `phone_number`           | TEXT      | Driver's phone number                               |
| `eqama_number`           | TEXT      | Driver's Iqama (residency) number (Unique)          |
| `day_shift_equipment_id` | INTEGER   | ID of equipment assigned for day shift (Foreign Key to Equipment table) |
| `night_shift_equipment_id`| INTEGER   | ID of equipment assigned for night shift (Foreign Key to Equipment table) |

## 3. Requests Table

This table stores information about equipment requests made by engineers.

| Column Name           | Data Type | Description                                           |
| --------------------- | --------- | ----------------------------------------------------- |
| `request_id`          | INTEGER   | Unique identifier for the request (Primary Key)       |
| `engineer_name`       | TEXT      | Name of the engineer making the request               |
| `requested_equipment` | INTEGER   | The ID of the requested equipment (Foreign Key to Equipment table) |
| `request_time`        | TIMESTAMP | The date and time the request was made                |
| `status`              | TEXT      | The status of the request (e.g., "Pending", "Approved") |
| `notes`               | TEXT      | Additional notes for the request                      |

