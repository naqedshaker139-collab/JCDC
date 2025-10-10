# Equipment Categories and Icons

Based on the unique equipment names from the database, here's a proposed categorization and icon mapping:

## Categories:

1.  **Forklifts**
    *   `Forklift 10Ton`
    *   `Forklift 16Ton`
    *   Icon: `Forklift` (from Lucide React)

2.  **Telehandlers**
    *   `Telehanlder`
    *   Icon: `Crane` (from Lucide React)

3.  **Loaders**
    *   `Backhoe Loader`
    *   `Skid Steel Loader`
    *   `Wheel Loader`
    *   Icon: `Loader` (from Lucide React)

4.  **Rollers/Compactors**
    *   `Roller Compactor 3 Ton`
    *   `Roller Compactor 10Ton`
    *   `Roller Compactor  10Ton`
    *   Icon: `RollerCoaster` (from Lucide React - closest available)

5.  **Excavators**
    *   `Mini Excavator`
    *   `Excavator`
    *   Icon: `Excavate` (from Lucide React)

6.  **Trucks**
    *   `Water Tanker(18000LTR)`
    *   `Boom Truck`
    *   `Boom Truck `
    *   `Dumper Truck`
    *   `TRAILA TRUCK`
    *   `Concrete Mixer Truck`
    *   `Fire Truck`
    *   `Lowbed`
    *   `Trailer`
    *   `Dyna-3Ton`
    *   Icon: `Truck` (from Lucide React)

7.  **Cranes**
    *   `TOWERCRANE`
    *   `Mobile Crane -Truck Mounted`
    *   `Mobile Crane -RT `
    *   `Mobile Crane `
    *   `Crawler Crane `
    *   Icon: `Crane` (from Lucide React)

8.  **Manlifts/Scissor Lifts**
    *   `Manlift 22M With Operator`
    *   `Manlif 26M With operator`
    *   `Scissor lift With operator`
    *   Icon: `Lift` (from Lucide React)

9.  **Graders**
    *   `Grader`
    *   Icon: `Gauge` (from Lucide React - closest available)

## UI Flow:

1.  **Equipment Page:** Will initially display a list of categories with their respective icons.
2.  **Category Click:** Clicking a category icon will filter the equipment list to show only equipment belonging to that category.
3.  **Equipment Card:** Each equipment card will prominently display:
    *   Equipment Name
    *   **Asset No.**
    *   **Plate No./Serial No.**
    *   **Zone/Department**
    *   Assigned Driver(s) (Day/Night Shift)
    *   **Driver Phone Number(s)**
    *   Status, Shift Type, etc.

## Data Requirements:

-   The backend API for `/api/equipment` needs to be modified to include the phone number of the assigned driver(s) directly within the equipment object, to avoid additional frontend calls.
-   The frontend will handle the categorization logic based on `equipment_name` and the defined categories.

