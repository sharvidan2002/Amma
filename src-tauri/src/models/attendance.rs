use serde::{Deserialize, Serialize};
use mongodb::bson::{oid::ObjectId, DateTime};
use std::collections::HashMap;

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
    #[serde(rename = "leaveBalance")]
    pub leave_balance: i32, // Remaining leave days (42 per year)
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
    #[serde(rename = "leave")]
    Leave,
    #[serde(rename = "sick-leave")]
    SickLeave,
    #[serde(rename = "casual-leave")]
    CasualLeave,
    #[serde(rename = "annual-leave")]
    AnnualLeave,
    #[serde(rename = "emergency-leave")]
    EmergencyLeave,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeaveApplication {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "employeeId")]
    pub employee_id: String,
    #[serde(rename = "employeeNumber")]
    pub employee_number: String,
    #[serde(rename = "leaveType")]
    pub leave_type: LeaveType,
    #[serde(rename = "startDate")]
    pub start_date: String, // dd-MM-yyyy
    #[serde(rename = "endDate")]
    pub end_date: String, // dd-MM-yyyy
    #[serde(rename = "totalDays")]
    pub total_days: i32,
    #[serde(rename = "isHalfDay")]
    pub is_half_day: bool,
    pub reason: String,
    pub status: LeaveStatus,
    #[serde(rename = "appliedDate")]
    pub applied_date: String, // dd-MM-yyyy
    #[serde(rename = "approvedBy", skip_serializing_if = "Option::is_none")]
    pub approved_by: Option<String>,
    #[serde(rename = "approvedDate", skip_serializing_if = "Option::is_none")]
    pub approved_date: Option<String>,
    #[serde(rename = "rejectedReason", skip_serializing_if = "Option::is_none")]
    pub rejected_reason: Option<String>,
    #[serde(rename = "createdAt", skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime>,
    #[serde(rename = "updatedAt", skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum LeaveType {
    #[serde(rename = "sick-leave")]
    SickLeave,
    #[serde(rename = "casual-leave")]
    CasualLeave,
    #[serde(rename = "annual-leave")]
    AnnualLeave,
    #[serde(rename = "emergency-leave")]
    EmergencyLeave,
    #[serde(rename = "maternity-leave")]
    MaternityLeave,
    #[serde(rename = "paternity-leave")]
    PaternityLeave,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum LeaveStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "approved")]
    Approved,
    #[serde(rename = "rejected")]
    Rejected,
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
    #[serde(rename = "totalLeaves")]
    pub total_leaves: i32,
    #[serde(rename = "leaveBreakdown")]
    pub leave_breakdown: HashMap<String, i32>,
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
pub struct CreateLeaveRequest {
    #[serde(flatten)]
    pub leave_application: LeaveApplication,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateLeaveRequest {
    pub status: LeaveStatus,
    #[serde(rename = "approvedBy", skip_serializing_if = "Option::is_none")]
    pub approved_by: Option<String>,
    #[serde(rename = "rejectedReason", skip_serializing_if = "Option::is_none")]
    pub rejected_reason: Option<String>,
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
pub struct LeaveResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<LeaveApplication>,
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