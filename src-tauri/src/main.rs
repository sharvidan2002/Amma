// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use employee_management_system::{
    AppState,
    commands::{employee::*, attendance::*, print::*},
    database::connection::init_database,
};
use tauri::{Manager};

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenv::dotenv().ok();

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();

            // Spawn the database initialization in a separate task
            tauri::async_runtime::spawn(async move {
                match init_database().await {
                    Ok(db) => {
                        handle.manage(AppState { db });
                        println!("Database initialized successfully");
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                        std::process::exit(1);
                    }
                }
            });

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