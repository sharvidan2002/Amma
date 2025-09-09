use serde::{Deserialize, Serialize};
use mongodb::bson::{oid::ObjectId, DateTime};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AttendanceRecord {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "employeeId")]
    pub employee_id: String,
    #[serde(rename = "employeeNumber")]
    pub employee_number: String,
    pub month: i32, // 1-12
    pub year: i32,
    pub records: Vec<DailyAttendance>,
    #[serde(rename = "createdAt", skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime>,
    #[serde(rename = "updatedAt", skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DailyAttendance {
    pub date: i32, // Day of month (1-31)
    pub status: AttendanceStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AttendanceStatus {
    #[serde(rename = "present")]
    Present,
    #[serde(rename = "absent")]
    Absent,
    #[serde(rename = "half-day")]
    HalfDay,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MonthlyAttendanceSummary {
    #[serde(rename = "employeeId")]
    pub employee_id: String,
    #[serde(rename = "employeeNumber")]
    pub employee_number: String,
    #[serde(rename = "fullName")]
    pub full_name: String,
    pub month: i32,
    pub year: i32,
    #[serde(rename = "totalWorkingDays")]
    pub total_working_days: i32,
    #[serde(rename = "totalPresent")]
    pub total_present: i32,
    #[serde(rename = "totalAbsent")]
    pub total_absent: i32,
    #[serde(rename = "totalHalfDays")]
    pub total_half_days: i32,
    #[serde(rename = "attendancePercentage")]
    pub attendance_percentage: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AttendanceFilter {
    #[serde(rename = "employeeNumber", skip_serializing_if = "Option::is_none")]
    pub employee_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub month: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub year: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<AttendanceStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub designation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub department: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAttendanceRequest {
    #[serde(rename = "employeeId")]
    pub employee_id: String,
    pub month: i32,
    pub year: i32,
    pub records: Vec<DailyAttendance>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAttendanceRequest {
    #[serde(rename = "employeeId")]
    pub employee_id: String,
    pub date: i32,
    pub status: AttendanceStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AttendanceResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<AttendanceRecord>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MonthlySummaryResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Vec<MonthlyAttendanceSummary>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}