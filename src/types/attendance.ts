export interface AttendanceRecord {
  _id?: string;
  employeeId: string;
  employeeNumber: string;
  month: number; // 1-12
  year: number;
  records: DailyAttendance[];
  leaveBalance: number; // Remaining leave days (42 per year)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyAttendance {
  date: number; // Day of month (1-31)
  status: AttendanceStatus;
  notes?: string;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'half-day'
  | 'leave'
  | 'sick-leave'
  | 'casual-leave'
  | 'annual-leave'
  | 'emergency-leave';

export interface LeaveApplication {
  _id?: string;
  employeeId: string;
  employeeNumber: string;
  leaveType: LeaveType;
  startDate: string; // dd-MM-yyyy
  endDate: string; // dd-MM-yyyy
  totalDays: number;
  isHalfDay: boolean;
  reason: string;
  status: LeaveStatus;
  appliedDate: string; // dd-MM-yyyy
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeaveType =
  | 'sick-leave'
  | 'casual-leave'
  | 'annual-leave'
  | 'emergency-leave'
  | 'maternity-leave'
  | 'paternity-leave';

export type LeaveStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface MonthlyAttendanceSummary {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  month: number;
  year: number;
  totalWorkingDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDays: number;
  totalLeaves: number;
  leaveBreakdown: {
    [key in LeaveType]: number;
  };
  attendancePercentage: number;
}

export interface AttendanceFilter {
  employeeNumber?: string;
  month?: number;
  year?: number;
  status?: AttendanceStatus;
  designation?: string;
  department?: string;
}