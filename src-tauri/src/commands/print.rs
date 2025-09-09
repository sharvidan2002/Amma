use crate::models::{employee::Employee, attendance::*};
use crate::database::{Collections, helpers::*};
use crate::AppState;
use mongodb::bson::{doc};
use tauri::State;
use futures::stream::TryStreamExt;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct PrintOptions {
    pub format: String, // "html" or "pdf"
    pub orientation: String, // "portrait" or "landscape"
    pub include_image: bool,
    pub filename: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportOptions {
    pub format: String, // "excel", "csv", "pdf"
    pub filename: String,
    pub headers: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrintResponse {
    pub success: bool,
    pub file_path: Option<String>,
    pub message: Option<String>,
    pub error: Option<String>,
}

/// Generate individual employee report
#[tauri::command]
pub async fn generate_employee_report(
    state: State<'_, AppState>,
    employee_id: String,
    options: PrintOptions,
) -> Result<PrintResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    // Find employee
    let filter = id_filter(&employee_id)
        .map_err(|e| format!("Invalid employee ID: {}", e))?;

    let employee = collection.find_one(filter, None)
        .await
        .map_err(|e| format!("Failed to find employee: {}", e))?;

    match employee {
        Some(emp) => {
            if options.format == "html" {
                generate_html_employee_report(emp, options).await
            } else {
                generate_pdf_employee_report(emp, options).await
            }
        },
        None => Ok(PrintResponse {
            success: false,
            file_path: None,
            message: None,
            error: Some("Employee not found".to_string()),
        }),
    }
}

/// Generate bulk employee report
#[tauri::command]
pub async fn generate_bulk_report(
    state: State<'_, AppState>,
    employee_ids: Vec<String>,
    options: PrintOptions,
) -> Result<PrintResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    // Convert string IDs to ObjectIds and create filter
    let mut object_ids = Vec::new();
    for id in employee_ids {
        match id_filter(&id) {
            Ok(filter) => {
                if let Some(oid) = filter.get("_id") {
                    object_ids.push(oid.clone());
                }
            },
            Err(e) => return Err(format!("Invalid employee ID {}: {}", id, e)),
        }
    }

    let filter = doc! { "_id": { "$in": object_ids } };

    // Find employees
    let mut cursor = collection.find(filter, None)
        .await
        .map_err(|e| format!("Failed to find employees: {}", e))?;

    let mut employees = Vec::new();
    while let Some(employee) = cursor.try_next()
        .await
        .map_err(|e| format!("Failed to iterate employees: {}", e))? {
        employees.push(employee);
    }

    if options.format == "html" {
        generate_html_bulk_report(employees, options).await
    } else {
        generate_pdf_bulk_report(employees, options).await
    }
}

/// Generate attendance report
#[tauri::command]
pub async fn generate_attendance_report(
    state: State<'_, AppState>,
    month: i32,
    year: i32,
    options: PrintOptions,
) -> Result<PrintResponse, String> {
    let db = &state.db;
    let attendance_collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);
    let employee_collection = db.collection::<Employee>(Collections::EMPLOYEES);

    // Get all attendance records for the month
    let filter = doc! { "month": month, "year": year };
    let mut cursor = attendance_collection.find(filter, None)
        .await
        .map_err(|e| format!("Failed to find attendance records: {}", e))?;

    let mut attendance_data = Vec::new();

    while let Some(record) = cursor.try_next()
        .await
        .map_err(|e| format!("Failed to iterate attendance records: {}", e))? {

        // Get employee details
        let emp_filter = id_filter(&record.employee_id)
            .map_err(|e| format!("Invalid employee ID: {}", e))?;

        let employee = employee_collection.find_one(emp_filter, None)
            .await
            .map_err(|e| format!("Failed to find employee: {}", e))?;

        if let Some(emp) = employee {
            attendance_data.push((emp, record));
        }
    }

    if options.format == "html" {
        generate_html_attendance_report(attendance_data, month, year, options).await
    } else {
        generate_pdf_attendance_report(attendance_data, month, year, options).await
    }
}

/// Export to Excel
#[tauri::command]
pub async fn export_to_excel(
    _state: State<'_, AppState>,
    _data: serde_json::Value,
    _options: ExportOptions,
) -> Result<PrintResponse, String> {
    // This would require a Rust Excel library like calamine or xlsxwriter
    // For now, return a placeholder response
    Ok(PrintResponse {
        success: false,
        file_path: None,
        message: None,
        error: Some("Excel export not yet implemented".to_string()),
    })
}

/// Export to CSV
#[tauri::command]
pub async fn export_to_csv(
    _state: State<'_, AppState>,
    data: serde_json::Value,
    options: ExportOptions,
) -> Result<PrintResponse, String> {
    use csv::Writer;

    // Get downloads directory
    let downloads_dir = tauri::api::path::download_dir()
        .ok_or_else(|| "Failed to get downloads directory".to_string())?;

    let file_path = downloads_dir.join(&options.filename);

    // Create CSV writer
    let mut wtr = Writer::from_path(&file_path)
        .map_err(|e| format!("Failed to create CSV file: {}", e))?;

    // Write headers
    wtr.write_record(&options.headers)
        .map_err(|e| format!("Failed to write CSV headers: {}", e))?;

    // Write data rows
    if let Some(array) = data.as_array() {
        for row in array {
            if let Some(obj) = row.as_object() {
                let mut record = Vec::new();
                for header in &options.headers {
                    let value = obj.get(header)
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();
                    record.push(value);
                }
                wtr.write_record(&record)
                    .map_err(|e| format!("Failed to write CSV record: {}", e))?;
            }
        }
    }

    wtr.flush()
        .map_err(|e| format!("Failed to flush CSV file: {}", e))?;

    Ok(PrintResponse {
        success: true,
        file_path: Some(file_path.to_string_lossy().to_string()),
        message: Some("CSV file exported successfully".to_string()),
        error: None,
    })
}

// Helper functions for generating reports

async fn generate_html_employee_report(
    employee: Employee,
    options: PrintOptions,
) -> Result<PrintResponse, String> {
    let downloads_dir = tauri::api::path::download_dir()
        .ok_or_else(|| "Failed to get downloads directory".to_string())?;

    let file_path = downloads_dir.join(&options.filename);

    let html_content = format!(
        r#"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Report - {}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; color: #333; }}
        .header {{ text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }}
        .employee-photo {{ width: 120px; height: 120px; border-radius: 8px; object-fit: cover; }}
        .section {{ margin-bottom: 30px; }}
        .section-title {{ background: #f8fafc; padding: 10px; border-left: 4px solid #dc2626; font-weight: bold; margin-bottom: 15px; }}
        .detail-row {{ display: flex; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }}
        .detail-label {{ font-weight: 600; color: #475569; min-width: 200px; }}
        .detail-value {{ color: #1e293b; }}
        @media print {{ .no-print {{ display: none; }} }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Employee Management System</h1>
        <h2>Employee Report</h2>
        {}
    </div>

    <div class="section">
        <div class="section-title">Basic Information</div>
        <div class="detail-row">
            <span class="detail-label">Employee Number:</span>
            <span class="detail-value">{}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Full Name:</span>
            <span class="detail-value">{}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Designation:</span>
            <span class="detail-value">{:?}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ministry:</span>
            <span class="detail-value">{}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Gender:</span>
            <span class="detail-value">{:?}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Contact Information</div>
        <div class="detail-row">
            <span class="detail-label">Address:</span>
            <span class="detail-value">{}<br>{}<br>{}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Mobile:</span>
            <span class="detail-value">+94 {}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Employment Information</div>
        <div class="detail-row">
            <span class="detail-label">NIC Number:</span>
            <span class="detail-value">{}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date of Birth:</span>
            <span class="detail-value">{}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Age:</span>
            <span class="detail-value">{} years</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">First Appointment:</span>
            <span class="detail-value">{}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Salary Code:</span>
            <span class="detail-value">{:?}</span>
        </div>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 40px;">
        <button onclick="window.print()" style="background: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Print Report</button>
    </div>
</body>
</html>
        "#,
        employee.full_name,
        if options.include_image && employee.image.is_some() {
            format!("<img src='{}' alt='{}' class='employee-photo' />",
                   employee.image.as_ref().unwrap(),
                   employee.full_name)
        } else {
            String::new()
        },
        employee.employee_number,
        employee.full_name,
        employee.designation,
        employee.ministry,
        employee.gender,
        employee.personal_address.line1,
        employee.personal_address.line2,
        employee.personal_address.line3,
        employee.mobile_number,
        employee.email_address,
        employee.nic_number,
        employee.date_of_birth,
        employee.age,
        employee.first_appointment_date,
        employee.salary_code
    );

    fs::write(&file_path, html_content)
        .map_err(|e| format!("Failed to write HTML file: {}", e))?;

    Ok(PrintResponse {
        success: true,
        file_path: Some(file_path.to_string_lossy().to_string()),
        message: Some("HTML report generated successfully".to_string()),
        error: None,
    })
}

async fn generate_pdf_employee_report(
    _employee: Employee,
    _options: PrintOptions,
) -> Result<PrintResponse, String> {
    // PDF generation would require a library like wkhtmltopdf or headless Chrome
    Ok(PrintResponse {
        success: false,
        file_path: None,
        message: None,
        error: Some("PDF generation not yet implemented".to_string()),
    })
}

async fn generate_html_bulk_report(
    employees: Vec<Employee>,
    options: PrintOptions,
) -> Result<PrintResponse, String> {
    let downloads_dir = tauri::api::path::download_dir()
        .ok_or_else(|| "Failed to get downloads directory".to_string())?;

    let file_path = downloads_dir.join(&options.filename);

    let table_rows: String = employees.iter().map(|emp| {
        format!(
            r#"
            <tr>
                <td>{}</td>
                <td>{}</td>
                <td>{:?}</td>
                <td>{}</td>
                <td>{:?}</td>
                <td>{}</td>
                <td>{}</td>
                <td>{}</td>
                <td>{}</td>
                <td>{:?}</td>
                <td>{:?}</td>
                <td>{}</td>
            </tr>
            "#,
            emp.employee_number,
            emp.full_name,
            emp.designation,
            emp.ministry,
            emp.gender,
            emp.mobile_number,
            emp.nic_number,
            emp.date_of_birth,
            emp.age,
            emp.salary_code,
            emp.central_provincial,
            if emp.service_confirmed { "Yes" } else { "No" }
        )
    }).collect();

    let html_content = format!(
        r#"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee List Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 15px; font-size: 10px; }}
        .header {{ text-align: center; margin-bottom: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ border: 1px solid #cbd5e1; padding: 4px; text-align: left; font-size: 9px; }}
        th {{ background-color: #f8fafc; font-weight: bold; }}
        tr:nth-child(even) {{ background-color: #f8fafc; }}
        @media print {{ .no-print {{ display: none; }} body {{ margin: 0; }} }}
        @page {{ size: landscape; margin: 10mm; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Employee Management System</h1>
        <h2>Employee List Report</h2>
        <p>Total Employees: {} | Generated on {}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Employee #</th>
                <th>Full Name</th>
                <th>Designation</th>
                <th>Ministry</th>
                <th>Gender</th>
                <th>Mobile</th>
                <th>NIC</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Salary Code</th>
                <th>Central/Provincial</th>
                <th>Service Confirmed</th>
            </tr>
        </thead>
        <tbody>
            {}
        </tbody>
    </table>

    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="background: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Print Report</button>
    </div>
</body>
</html>
        "#,
        employees.len(),
        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"),
        table_rows
    );

    fs::write(&file_path, html_content)
        .map_err(|e| format!("Failed to write HTML file: {}", e))?;

    Ok(PrintResponse {
        success: true,
        file_path: Some(file_path.to_string_lossy().to_string()),
        message: Some("Bulk HTML report generated successfully".to_string()),
        error: None,
    })
}

async fn generate_pdf_bulk_report(
    _employees: Vec<Employee>,
    _options: PrintOptions,
) -> Result<PrintResponse, String> {
    Ok(PrintResponse {
        success: false,
        file_path: None,
        message: None,
        error: Some("PDF generation not yet implemented".to_string()),
    })
}

async fn generate_html_attendance_report(
    _attendance_data: Vec<(Employee, AttendanceRecord)>,
    _month: i32,
    _year: i32,
    _options: PrintOptions,
) -> Result<PrintResponse, String> {
    Ok(PrintResponse {
        success: false,
        file_path: None,
        message: None,
        error: Some("Attendance HTML report not yet implemented".to_string()),
    })
}

async fn generate_pdf_attendance_report(
    _attendance_data: Vec<(Employee, AttendanceRecord)>,
    _month: i32,
    _year: i32,
    _options: PrintOptions,
) -> Result<PrintResponse, String> {
    Ok(PrintResponse {
        success: false,
        file_path: None,
        message: None,
        error: Some("PDF generation not yet implemented".to_string()),
    })
}