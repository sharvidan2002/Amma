pub mod employee;
pub mod attendance;

// Use specific exports instead of glob exports to avoid naming conflicts
pub use employee::{
    Employee, EmployeeFilter, EmployeeResponse, EmployeesResponse,
    CreateEmployeeRequest, UpdateEmployeeRequest, Address, GradeAppointmentDates,
    Designation, Gender, CentralProvincial, MaritalStatus, SalaryCode, AgeRange
};

pub use attendance::{
    AttendanceRecord, DailyAttendance, AttendanceStatus, LeaveApplication,
    LeaveType, LeaveStatus, MonthlyAttendanceSummary, AttendanceFilter,
    CreateAttendanceRequest, UpdateAttendanceRequest, CreateLeaveRequest,
    UpdateLeaveRequest, AttendanceResponse, LeaveResponse, MonthlySummaryResponse
};