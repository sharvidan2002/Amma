use crate::models::employee::*;
use crate::database::{Collections, helpers::*};
use crate::AppState;
use mongodb::bson::{doc, oid::ObjectId, DateTime};
use mongodb::options::{FindOptions, UpdateOptions};
use tauri::State;
use futures::stream::TryStreamExt;

/// Get all employees with optional filtering and pagination
#[tauri::command]
pub async fn get_employees(
    state: State<'_, AppState>,
    filter: Option<EmployeeFilter>,
    pagination: Option<PaginationOptions>,
) -> Result<EmployeesResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    let pagination = pagination.unwrap_or_default();

    // Build filter document
    let mut filter_doc = doc! {};

    if let Some(f) = filter {
        if let Some(emp_num) = f.employee_number {
            filter_doc.insert("employeeNumber", doc! { "$regex": emp_num, "$options": "i" });
        }
        if let Some(name) = f.full_name {
            filter_doc.insert("fullName", doc! { "$regex": name, "$options": "i" });
        }
        if let Some(designation) = f.designation {
            filter_doc.insert("designation", designation);
        }
        if let Some(ministry) = f.ministry {
            filter_doc.insert("ministry", doc! { "$regex": ministry, "$options": "i" });
        }
        if let Some(nic) = f.nic_number {
            filter_doc.insert("nicNumber", doc! { "$regex": nic, "$options": "i" });
        }
        if let Some(gender) = f.gender {
            filter_doc.insert("gender", gender);
        }
        if let Some(salary_code) = f.salary_code {
            filter_doc.insert("salaryCode", salary_code);
        }
        if let Some(age_range) = f.age_range {
            filter_doc.insert("age", doc! { "$gte": age_range.min, "$lte": age_range.max });
        }
    }

    // Get total count
    let total = collection.count_documents(filter_doc.clone(), None)
        .await
        .map_err(|e| format!("Failed to count employees: {}", e))?;

    // Set up find options
    let find_options = FindOptions::builder()
        .sort(pagination.sort_doc())
        .skip(pagination.skip())
        .limit(pagination.limit as i64)
        .build();

    // Find employees
    let mut cursor = collection.find(filter_doc, find_options)
        .await
        .map_err(|e| format!("Failed to find employees: {}", e))?;

    let mut employees = Vec::new();
    while let Some(employee) = cursor.try_next()
        .await
        .map_err(|e| format!("Failed to iterate employees: {}", e))? {
        employees.push(employee);
    }

    let total_pages = ((total as f64) / (pagination.limit as f64)).ceil() as u64;

    Ok(EmployeesResponse {
        success: true,
        data: Some(employees),
        total,
        page: pagination.page,
        limit: pagination.limit,
        total_pages,
        message: None,
        error: None,
    })
}

/// Get employee by ID
#[tauri::command]
pub async fn get_employee_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<EmployeeResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    let filter = id_filter(&id)
        .map_err(|e| format!("Invalid employee ID: {}", e))?;

    match collection.find_one(filter, None).await {
        Ok(Some(employee)) => Ok(EmployeeResponse {
            success: true,
            data: Some(employee),
            message: None,
            error: None,
        }),
        Ok(None) => Ok(EmployeeResponse {
            success: false,
            data: None,
            message: Some("Employee not found".to_string()),
            error: None,
        }),
        Err(e) => Ok(EmployeeResponse {
            success: false,
            data: None,
            message: None,
            error: Some(format!("Failed to get employee: {}", e)),
        }),
    }
}

/// Create a new employee
#[tauri::command]
pub async fn create_employee(
    state: State<'_, AppState>,
    request: CreateEmployeeRequest,
) -> Result<EmployeeResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    // Check if employee number already exists
    let existing = collection.find_one(
        doc! { "employeeNumber": &request.employee.employee_number },
        None
    ).await
        .map_err(|e| format!("Failed to check existing employee: {}", e))?;

    if existing.is_some() {
        return Ok(EmployeeResponse {
            success: false,
            data: None,
            message: None,
            error: Some("Employee number already exists".to_string()),
        });
    }

    let mut employee = request.employee;
    employee.id = Some(ObjectId::new());
    employee.created_at = Some(DateTime::now());
    employee.updated_at = Some(DateTime::now());

    match collection.insert_one(&employee, None).await {
        Ok(_) => Ok(EmployeeResponse {
            success: true,
            data: Some(employee),
            message: Some("Employee created successfully".to_string()),
            error: None,
        }),
        Err(e) => Ok(EmployeeResponse {
            success: false,
            data: None,
            message: None,
            error: Some(format!("Failed to create employee: {}", e)),
        }),
    }
}

/// Update an existing employee
#[tauri::command]
pub async fn update_employee(
    state: State<'_, AppState>,
    id: String,
    request: UpdateEmployeeRequest,
) -> Result<EmployeeResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    let filter = id_filter(&id)
        .map_err(|e| format!("Invalid employee ID: {}", e))?;

    let mut employee = request.employee;
    employee.updated_at = Some(DateTime::now());

    let update_doc = doc! {
        "$set": mongodb::bson::to_bson(&employee)
            .map_err(|e| format!("Failed to serialize employee: {}", e))?
    };

    let options = UpdateOptions::builder().upsert(false).build();

    match collection.update_one(filter, update_doc, options).await {
        Ok(result) => {
            if result.matched_count == 0 {
                Ok(EmployeeResponse {
                    success: false,
                    data: None,
                    message: Some("Employee not found".to_string()),
                    error: None,
                })
            } else {
                Ok(EmployeeResponse {
                    success: true,
                    data: Some(employee),
                    message: Some("Employee updated successfully".to_string()),
                    error: None,
                })
            }
        },
        Err(e) => Ok(EmployeeResponse {
            success: false,
            data: None,
            message: None,
            error: Some(format!("Failed to update employee: {}", e)),
        }),
    }
}

/// Delete an employee
#[tauri::command]
pub async fn delete_employee(
    state: State<'_, AppState>,
    id: String,
) -> Result<EmployeeResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    let filter = id_filter(&id)
        .map_err(|e| format!("Invalid employee ID: {}", e))?;

    match collection.delete_one(filter, None).await {
        Ok(result) => {
            if result.deleted_count == 0 {
                Ok(EmployeeResponse {
                    success: false,
                    data: None,
                    message: Some("Employee not found".to_string()),
                    error: None,
                })
            } else {
                Ok(EmployeeResponse {
                    success: true,
                    data: None,
                    message: Some("Employee deleted successfully".to_string()),
                    error: None,
                })
            }
        },
        Err(e) => Ok(EmployeeResponse {
            success: false,
            data: None,
            message: None,
            error: Some(format!("Failed to delete employee: {}", e)),
        }),
    }
}

/// Search employees
#[tauri::command]
pub async fn search_employees(
    state: State<'_, AppState>,
    query: String,
    pagination: Option<PaginationOptions>,
) -> Result<EmployeesResponse, String> {
    let db = &state.db;
    let collection = db.collection::<Employee>(Collections::EMPLOYEES);

    let pagination = pagination.unwrap_or_default();

    // Create search filter
    let search_options = SearchOptions {
        query,
        fields: vec![
            "employeeNumber".to_string(),
            "fullName".to_string(),
            "designation".to_string(),
            "ministry".to_string(),
            "nicNumber".to_string(),
            "emailAddress".to_string(),
        ],
        case_sensitive: false,
    };

    let filter_doc = search_options.to_filter();

    // Get total count
    let total = collection.count_documents(filter_doc.clone(), None)
        .await
        .map_err(|e| format!("Failed to count search results: {}", e))?;

    // Set up find options
    let find_options = FindOptions::builder()
        .sort(pagination.sort_doc())
        .skip(pagination.skip())
        .limit(pagination.limit as i64)
        .build();

    // Find employees
    let mut cursor = collection.find(filter_doc, find_options)
        .await
        .map_err(|e| format!("Failed to search employees: {}", e))?;

    let mut employees = Vec::new();
    while let Some(employee) = cursor.try_next()
        .await
        .map_err(|e| format!("Failed to iterate search results: {}", e))? {
        employees.push(employee);
    }

    let total_pages = ((total as f64) / (pagination.limit as f64)).ceil() as u64;

    Ok(EmployeesResponse {
        success: true,
        data: Some(employees),
        total,
        page: pagination.page,
        limit: pagination.limit,
        total_pages,
        message: None,
        error: None,
    })
}