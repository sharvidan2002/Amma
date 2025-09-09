use crate::models::attendance::*;
use crate::database::{Collections, helpers::*};
use crate::AppState;
use mongodb::bson::{doc, oid::ObjectId, DateTime};
use mongodb::options::{UpdateOptions};
use tauri::State;
use futures::stream::TryStreamExt;
use chrono::Datelike;

/// Get attendance records with optional filtering
#[tauri::command]
pub async fn get_attendance_records(
    state: State<'_, AppState>,
    filter: Option<AttendanceFilter>,
) -> Result<Vec<AttendanceRecord>, String> {
    let db = &state.db;
    let collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);

    let mut filter_doc = doc! {};

    if let Some(f) = filter {
        if let Some(emp_num) = f.employee_number {
            filter_doc.insert("employeeNumber", emp_num);
        }
        if let Some(month) = f.month {
            filter_doc.insert("month", month);
        }
        if let Some(year) = f.year {
            filter_doc.insert("year", year);
        }
    }

    let mut cursor = collection.find(filter_doc, None)
        .await
        .map_err(|e| format!("Failed to find attendance records: {}", e))?;

    let mut records = Vec::new();
    while let Some(record) = cursor.try_next()
        .await
        .map_err(|e| format!("Failed to iterate attendance records: {}", e))? {
        records.push(record);
    }

    Ok(records)
}

/// Create attendance record
#[tauri::command]
pub async fn create_attendance_record(
    state: State<'_, AppState>,
    request: CreateAttendanceRequest,
) -> Result<AttendanceResponse, String> {
    let db = &state.db;
    let collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);

    // Check if record already exists for this employee and month/year
    let existing = collection.find_one(
        doc! {
            "employeeId": &request.employee_id,
            "month": request.month,
            "year": request.year
        },
        None
    ).await
        .map_err(|e| format!("Failed to check existing record: {}", e))?;

    if existing.is_some() {
        return Ok(AttendanceResponse {
            success: false,
            data: None,
            message: None,
            error: Some("Attendance record already exists for this month".to_string()),
        });
    }

    let record = AttendanceRecord {
        id: Some(ObjectId::new()),
        employee_id: request.employee_id,
        employee_number: "".to_string(), // This should be populated from employee lookup
        month: request.month,
        year: request.year,
        records: request.records,
        created_at: Some(DateTime::now()),
        updated_at: Some(DateTime::now()),
    };

    match collection.insert_one(&record, None).await {
        Ok(_) => Ok(AttendanceResponse {
            success: true,
            data: Some(record),
            message: Some("Attendance record created successfully".to_string()),
            error: None,
        }),
        Err(e) => Ok(AttendanceResponse {
            success: false,
            data: None,
            message: None,
            error: Some(format!("Failed to create attendance record: {}", e)),
        }),
    }
}

/// Update attendance record
#[tauri::command]
pub async fn update_attendance_record(
    state: State<'_, AppState>,
    request: UpdateAttendanceRequest,
) -> Result<AttendanceResponse, String> {
    let db = &state.db;
    let collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);

    // Find the current month/year record
    let filter = doc! {
        "employeeId": &request.employee_id,
        "month": chrono::Utc::now().month() as i32,
        "year": chrono::Utc::now().year()
    };

    let daily_record = DailyAttendance {
        date: request.date,
        status: request.status,
        notes: request.notes,
    };

    // Update or insert the daily record
    let update_doc = doc! {
        "$set": {
            "updatedAt": DateTime::now()
        },
        "$addToSet": {
            "records": mongodb::bson::to_bson(&daily_record)
                .map_err(|e| format!("Failed to serialize daily record: {}", e))?
        }
    };

    let options = UpdateOptions::builder().upsert(true).build();

    match collection.update_one(filter, update_doc, options).await {
        Ok(_) => Ok(AttendanceResponse {
            success: true,
            data: None,
            message: Some("Attendance updated successfully".to_string()),
            error: None,
        }),
        Err(e) => Ok(AttendanceResponse {
            success: false,
            data: None,
            message: None,
            error: Some(format!("Failed to update attendance: {}", e)),
        }),
    }
}

/// Delete attendance record
#[tauri::command]
pub async fn delete_attendance_record(
    state: State<'_, AppState>,
    id: String,
) -> Result<AttendanceResponse, String> {
    let db = &state.db;
    let collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);

    let filter = id_filter(&id)
        .map_err(|e| format!("Invalid record ID: {}", e))?;

    match collection.delete_one(filter, None).await {
        Ok(result) => {
            if result.deleted_count == 0 {
                Ok(AttendanceResponse {
                    success: false,
                    data: None,
                    message: Some("Attendance record not found".to_string()),
                    error: None,
                })
            } else {
                Ok(AttendanceResponse {
                    success: true,
                    data: None,
                    message: Some("Attendance record deleted successfully".to_string()),
                    error: None,
                })
            }
        },
        Err(e) => Ok(AttendanceResponse {
            success: false,
            data: None,
            message: None,
            error: Some(format!("Failed to delete attendance record: {}", e)),
        }),
    }
}

/// Get monthly summary
#[tauri::command]
pub async fn get_monthly_summary(
    state: State<'_, AppState>,
    month: i32,
    year: i32,
) -> Result<MonthlySummaryResponse, String> {
    let db = &state.db;
    let attendance_collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);
    let employee_collection = db.collection::<crate::models::employee::Employee>(Collections::EMPLOYEES);

    // Get all attendance records for the specified month/year
    let filter = doc! { "month": month, "year": year };
    let mut cursor = attendance_collection.find(filter, None)
        .await
        .map_err(|e| format!("Failed to find attendance records: {}", e))?;

    let mut summaries = Vec::new();

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
            // Calculate statistics
            let total_working_days = chrono::NaiveDate::from_ymd_opt(year, month as u32, 1)
                .unwrap()
                .with_month(month as u32 + 1)
                .unwrap_or_else(|| chrono::NaiveDate::from_ymd_opt(year + 1, 1, 1).unwrap())
                .pred_opt()
                .unwrap()
                .day() as i32;

            let mut total_present = 0;
            let mut total_absent = 0;
            let mut total_half_days = 0;

            for daily in &record.records {
                match daily.status {
                    AttendanceStatus::Present => total_present += 1,
                    AttendanceStatus::Absent => total_absent += 1,
                    AttendanceStatus::HalfDay => total_half_days += 1,
                }
            }

            let attendance_percentage = if total_working_days > 0 {
                ((total_present as f64 + (total_half_days as f64 * 0.5)) / total_working_days as f64) * 100.0
            } else {
                0.0
            };

            summaries.push(MonthlyAttendanceSummary {
                employee_id: record.employee_id,
                employee_number: emp.employee_number,
                full_name: emp.full_name,
                month,
                year,
                total_working_days,
                total_present,
                total_absent,
                total_half_days,
                attendance_percentage,
            });
        }
    }

    Ok(MonthlySummaryResponse {
        success: true,
        data: Some(summaries),
        message: None,
        error: None,
    })
}

/// Backup monthly data
#[tauri::command]
pub async fn backup_monthly_data(
    state: State<'_, AppState>,
    month: i32,
    year: i32,
) -> Result<crate::commands::print::PrintResponse, String> {
    let db = &state.db;
    let attendance_collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);

    // Create backup directory
    let downloads_dir = tauri::api::path::download_dir()
        .ok_or_else(|| "Failed to get downloads directory".to_string())?;

    let backup_dir = downloads_dir.join(format!("backup_{}_{}", year, month));
    std::fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;

    // Backup attendance records
    let attendance_filter = doc! { "month": month, "year": year };
    let mut attendance_cursor = attendance_collection.find(attendance_filter, None)
        .await
        .map_err(|e| format!("Failed to find attendance records: {}", e))?;

    let mut attendance_records = Vec::new();
    while let Some(record) = attendance_cursor.try_next()
        .await
        .map_err(|e| format!("Failed to iterate attendance records: {}", e))? {
        attendance_records.push(record);
    }

    let attendance_file = backup_dir.join("attendance.json");
    let attendance_json = serde_json::to_string_pretty(&attendance_records)
        .map_err(|e| format!("Failed to serialize attendance data: {}", e))?;
    std::fs::write(&attendance_file, attendance_json)
        .map_err(|e| format!("Failed to write attendance backup: {}", e))?;

    Ok(crate::commands::print::PrintResponse {
        success: true,
        file_path: Some(backup_dir.to_string_lossy().to_string()),
        message: Some("Monthly data backed up successfully".to_string()),
        error: None,
    })
}

/// Clear monthly data
#[tauri::command]
pub async fn clear_monthly_data(
    state: State<'_, AppState>,
    month: i32,
    year: i32,
) -> Result<crate::commands::print::PrintResponse, String> {
    let db = &state.db;
    let attendance_collection = db.collection::<AttendanceRecord>(Collections::ATTENDANCE);

    // Delete attendance records
    let attendance_filter = doc! { "month": month, "year": year };
    let attendance_result = attendance_collection.delete_many(attendance_filter, None)
        .await
        .map_err(|e| format!("Failed to delete attendance records: {}", e))?;

    Ok(crate::commands::print::PrintResponse {
        success: true,
        file_path: None,
        message: Some(format!(
            "Cleared {} attendance records for {}/{}",
            attendance_result.deleted_count,
            month,
            year
        )),
        error: None,
    })
}