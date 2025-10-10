import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "dashboard": "Dashboard",
      "equipment": "Equipment",
      "drivers": "Drivers",
      "request_equipment": "Request Equipment",
      "request_history": "Request History",
      
      // Dashboard
      "welcome": "Welcome to Equipment Management System",
      "total_equipment": "Total Equipment",
      "available_equipment": "Available Equipment",
      "total_drivers": "Total Drivers",
      "pending_requests": "Pending Requests",
      
      // Equipment
      "asset_no": "Asset No.",
      "equipment_name": "Equipment Name",
      "plate_serial_no": "Plate No./Serial No.",
      "shift_type": "Shift Type",
      "num_shifts_requested": "No. of Shifts Requested",
      "status": "Status",
      "zone_department": "Zone/Department",
      "mobilized_date": "Mobilized Date",
      "demobilization_date": "Demobilization Date",
      "company_supplier": "Company/Supplier",
      "remarks": "Remarks",
      "assigned_driver": "Assigned Driver",
      "add_equipment": "Add Equipment",
      "search_equipment": "Search equipment...",
      "unassigned": "Unassigned",
      
      // Equipment Categories
      "forklifts": "Forklifts",
      "telehandlers": "Telehandlers",
      "loaders": "Loaders",
      "rollers_compactors": "Rollers/Compactors",
      "excavators": "Excavators",
      "trucks": "Trucks",
      "cranes": "Cranes",
      "lifts": "Lifts",
      "graders": "Graders",
      
      // Drivers
      "driver_name": "Driver Name",
      "phone_number": "Phone Number",
      "eqama_number": "Iqama Number",
      "assigned_machine": "Assigned Machine",
      "add_driver": "Add Driver",
      "search_drivers": "Search drivers...",
      "call": "Call",
      "day_shift": "Day Shift",
      "night_shift": "Night Shift",
      
      // Requests
      "engineer_name": "Engineer Name",
      "requested_equipment": "Requested Equipment",
      "request_time": "Request Time",
      "notes": "Notes",
      "submit_request": "Submit Request",
      "request_reason": "Request Reason",
      
      // Status
      "available": "Available",
      "active": "Active",
      "in_use": "In Use",
      "maintenance": "Maintenance",
      "pending": "Pending",
      "approved": "Approved",
      "completed": "Completed",
      
      // Actions
      "search": "Search",
      "filter": "Filter",
      "submit": "Submit",
      "cancel": "Cancel",
      "save": "Save",
      "edit": "Edit",
      "delete": "Delete",
      "view": "View",
      "back": "Back",
      
      // General
      "language": "en"
    }
  },
  ar: {
    translation: {
      // Navigation
      "dashboard": "لوحة التحكم",
      "equipment": "المعدات",
      "drivers": "السائقين",
      "request_equipment": "طلب معدة",
      "request_history": "تاريخ الطلبات",
      
      // Dashboard
      "welcome": "مرحباً بك في نظام إدارة المعدات",
      "total_equipment": "إجمالي المعدات",
      "available_equipment": "المعدات المتاحة",
      "total_drivers": "إجمالي السائقين",
      "pending_requests": "الطلبات المعلقة",
      
      // Equipment
      "asset_no": "رقم الأصل",
      "equipment_name": "اسم المعدة",
      "plate_serial_no": "رقم اللوحة/الرقم التسلسلي",
      "shift_type": "نوع الوردية",
      "num_shifts_requested": "عدد الورديات المطلوبة",
      "status": "الحالة",
      "zone_department": "المنطقة/القسم",
      "mobilized_date": "تاريخ التعبئة",
      "demobilization_date": "تاريخ التسريح",
      "company_supplier": "الشركة/المورد",
      "remarks": "ملاحظات",
      "assigned_driver": "السائق المخصص",
      "add_equipment": "إضافة معدة",
      "search_equipment": "البحث عن معدة...",
      "unassigned": "غير مخصص",
      
      // Equipment Categories
      "forklifts": "الرافعات الشوكية",
      "telehandlers": "الرافعات التلسكوبية",
      "loaders": "المحملات",
      "rollers_compactors": "الضاغطات",
      "excavators": "الحفارات",
      "trucks": "الشاحنات",
      "cranes": "الرافعات",
      "lifts": "المصاعد",
      "graders": "المسويات",
      
      // Drivers
      "driver_name": "اسم السائق",
      "phone_number": "رقم الهاتف",
      "eqama_number": "رقم الإقامة",
      "assigned_machine": "الآلة المخصصة",
      "add_driver": "إضافة سائق",
      "search_drivers": "البحث عن سائقين...",
      "call": "اتصال",
      "day_shift": "وردية النهار",
      "night_shift": "وردية الليل",
      
      // Requests
      "engineer_name": "اسم المهندس",
      "requested_equipment": "المعدة المطلوبة",
      "request_time": "وقت الطلب",
      "notes": "ملاحظات",
      "submit_request": "إرسال الطلب",
      "request_reason": "سبب الطلب",
      
      // Status
      "available": "متاح",
      "active": "نشط",
      "in_use": "قيد الاستخدام",
      "maintenance": "صيانة",
      "pending": "معلق",
      "approved": "موافق عليه",
      "completed": "مكتمل",
      
      // Actions
      "search": "بحث",
      "filter": "تصفية",
      "submit": "إرسال",
      "cancel": "إلغاء",
      "save": "حفظ",
      "edit": "تعديل",
      "delete": "حذف",
      "view": "عرض",
      "back": "رجوع",
      
      // General
      "language": "ar"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

