pub mod employee;
pub mod attendance;
pub mod print;

// Use specific exports instead of glob exports to avoid naming conflicts
pub use employee::{
    get_employees, get_employee_by_id, create_employee, update_employee,
    delete_employee, search_employees
};

pub use attendance::{
    get_attendance_records, create_attendance_record, update_attendance_record,
    delete_attendance_record, get_monthly_summary, backup_monthly_data, clear_monthly_data
};

pub use print::{
    generate_employee_report, generate_bulk_report, generate_attendance_report,
    export_to_excel, export_to_csv,
    PrintOptions, ExportOptions, PrintResponse
};