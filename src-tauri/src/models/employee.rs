use serde::{Deserialize, Serialize};
use mongodb::bson::{oid::ObjectId, DateTime};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Employee {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    // Basic Information
    #[serde(rename = "employeeNumber")]
    pub employee_number: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<String>, // Base64 encoded image
    #[serde(rename = "fullName")]
    pub full_name: String,
    pub designation: Designation,
    pub ministry: String,
    pub gender: Gender,

    // Address
    #[serde(rename = "personalAddress")]
    pub personal_address: Address,

    // Contact Information
    #[serde(rename = "mobileNumber")]
    pub mobile_number: String,
    #[serde(rename = "emailAddress")]
    pub email_address: String,

    // Identification
    #[serde(rename = "nicNumber")]
    pub nic_number: String,
    #[serde(rename = "dateOfBirth")]
    pub date_of_birth: String, // dd-MM-yyyy format
    pub age: i32,

    // Employment Dates
    #[serde(rename = "firstAppointmentDate")]
    pub first_appointment_date: String, // dd-MM-yyyy
    #[serde(rename = "gradeAppointmentDate")]
    pub grade_appointment_date: GradeAppointmentDates,

    // Additional Employment Info
    #[serde(rename = "appointmentLetterNo")]
    pub appointment_letter_no: String,
    #[serde(rename = "incrementDate")]
    pub increment_date: String, // dd-MM format
    #[serde(rename = "wopNumber")]
    pub wop_number: String,
    #[serde(rename = "educationalQualification")]
    pub educational_qualification: String,
    #[serde(rename = "centralProvincial")]
    pub central_provincial: CentralProvincial,
    #[serde(rename = "dateOfArrivalVDS")]
    pub date_of_arrival_vds: String, // dd-MM-yyyy
    pub status: String,
    #[serde(rename = "dateOfTransfer", skip_serializing_if = "Option::is_none")]
    pub date_of_transfer: Option<String>, // dd-MM-yyyy
    #[serde(rename = "ebPass")]
    pub eb_pass: bool,
    #[serde(rename = "serviceConfirmed")]
    pub service_confirmed: bool,
    #[serde(rename = "secondLanguagePassed")]
    pub second_language_passed: bool,
    #[serde(rename = "retiredDate")]
    pub retired_date: String, // Auto-calculated
    #[serde(rename = "maritalStatus")]
    pub marital_status: MaritalStatus,
    #[serde(rename = "salaryCode")]
    pub salary_code: SalaryCode,

    // Metadata
    #[serde(rename = "createdAt", skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime>,
    #[serde(rename = "updatedAt", skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Address {
    pub line1: String,
    pub line2: String,
    pub line3: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GradeAppointmentDates {
    #[serde(rename = "gradeIII", skip_serializing_if = "Option::is_none")]
    pub grade_iii: Option<String>,
    #[serde(rename = "gradeII", skip_serializing_if = "Option::is_none")]
    pub grade_ii: Option<String>,
    #[serde(rename = "gradeI", skip_serializing_if = "Option::is_none")]
    pub grade_i: Option<String>,
    #[serde(rename = "gradeSupra", skip_serializing_if = "Option::is_none")]
    pub grade_supra: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Designation {
    #[serde(rename = "District Officer")]
    DistrictOfficer,
    #[serde(rename = "Asst.District Officer")]
    AssistantDistrictOfficer,
    #[serde(rename = "Management Service Officer")]
    ManagementServiceOfficer,
    #[serde(rename = "Development Officer")]
    DevelopmentOfficer,
    #[serde(rename = "Extension officer")]
    ExtensionOfficer,
    #[serde(rename = "Office employee service")]
    OfficeEmployeeService,
    #[serde(rename = "Garden labour")]
    GardenLabour,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Gender {
    Male,
    Female,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CentralProvincial {
    Central,
    Provincial,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum MaritalStatus {
    Single,
    Married,
    Divorced,
    Widowed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SalaryCode {
    M1, M2, M3, A1, A2, B3, C3, C4,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmployeeFilter {
    #[serde(rename = "employeeNumber", skip_serializing_if = "Option::is_none")]
    pub employee_number: Option<String>,
    #[serde(rename = "fullName", skip_serializing_if = "Option::is_none")]
    pub full_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub designation: Option<Designation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ministry: Option<String>,
    #[serde(rename = "nicNumber", skip_serializing_if = "Option::is_none")]
    pub nic_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gender: Option<Gender>,
    #[serde(rename = "salaryCode", skip_serializing_if = "Option::is_none")]
    pub salary_code: Option<SalaryCode>,
    #[serde(rename = "ageRange", skip_serializing_if = "Option::is_none")]
    pub age_range: Option<AgeRange>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgeRange {
    pub min: i32,
    pub max: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateEmployeeRequest {
    #[serde(flatten)]
    pub employee: Employee,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateEmployeeRequest {
    #[serde(flatten)]
    pub employee: Employee,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmployeeResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Employee>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmployeesResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Vec<Employee>>,
    pub total: i64,
    pub page: u64,
    pub limit: u64,
    #[serde(rename = "totalPages")]
    pub total_pages: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}