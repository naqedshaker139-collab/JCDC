# Website Structure and Navigation

This document outlines the structure and navigation design for the equipment management website.

## Main Pages

### 1. Dashboard (Home Page)
The main landing page that provides an overview of the system and quick access to key functions.

**Features:**
- Welcome message in both English and Arabic
- Quick statistics (total equipment, available equipment, active requests)
- Language switcher prominently displayed
- Navigation menu to all main sections

### 2. Equipment List Page
A comprehensive list of all equipment with search and filter capabilities.

**Features:**
- Searchable and filterable table of all equipment
- Columns: Equipment Name, Machine Number, Type, Status, Assigned Driver
- Quick action buttons for each equipment item
- Add new equipment button (for administrators)

### 3. Driver Directory Page
A directory of all drivers and operators with their contact information.

**Features:**
- Searchable list of drivers
- Driver cards showing: Name, Phone, Iqama Number, Assigned Machine
- Contact buttons (call, message)
- Add new driver button (for administrators)

### 4. Request Equipment Page
A simple form for engineers to request equipment.

**Features:**
- Equipment selection dropdown
- Engineer name input
- Request reason/notes
- Submit button
- Request confirmation

### 5. Request History Page
A list of all equipment requests with their status.

**Features:**
- Table showing all requests
- Columns: Request ID, Engineer, Equipment, Date, Status
- Filter by status (Pending, Approved, Completed)
- Status update functionality

## Navigation Structure

```
Header Navigation:
├── Dashboard
├── Equipment
├── Drivers
├── Request Equipment
├── Request History
└── Language Switcher (EN/AR)
```

## User Interface Design Principles

### Simplicity
The interface will be clean and uncluttered, with large buttons and clear text to accommodate users who may not be tech-savvy.

### Multilingual Support
All text will be available in both English and Arabic, with proper right-to-left (RTL) support for Arabic.

### Mobile-First Design
The website will be designed with mobile devices as the primary consideration, ensuring it works well on smartphones and tablets.

### Professional Appearance
The design will reflect the professional nature of China Railway Construction Corporation with appropriate colors, typography, and branding.

### Accessibility
The interface will include high contrast colors, readable fonts, and intuitive navigation to ensure accessibility for all users.

