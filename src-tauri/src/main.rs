// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod models;

use commands::{employee::*, attendance::*, print::*};
use database::connection::init_database;
use tauri::{Manager, State};

// Application state
#[derive(Debug)]
pub struct AppState {
    pub db: mongodb::Database,
}

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenv::dotenv().ok();

    tauri::Builder::default()
        .setup(|app| {
            // Initialize database connection
            let rt = tokio::runtime::Handle::current();
            let db = rt.block_on(async {
                init_database().await.expect("Failed to initialize database")
            });

            // Store database in app state
            app.manage(AppState { db });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Employee commands
            get_employees,
            get_employee_by_id,
            create_employee,
            update_employee,
            delete_employee,
            search_employees,
            // Attendance commands
            get_attendance_records,
            create_attendance_record,
            update_attendance_record,
            delete_attendance_record,
            get_monthly_summary,
            // Leave commands
            get_leave_applications,
            create_leave_application,
            update_leave_application,
            approve_leave_application,
            reject_leave_application,
            // Print commands
            generate_employee_report,
            generate_bulk_report,
            generate_attendance_report,
            export_to_excel,
            export_to_csv,
            // Utility commands
            backup_monthly_data,
            clear_monthly_data,
            get_app_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Utility command to get app information
#[tauri::command]
async fn get_app_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "name": "Employee Management System",
        "version": "1.0.0",
        "description": "A modern employee management system"
    }))
}