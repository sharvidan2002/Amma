export interface AttendanceRecord {
  _id?: string;
  employeeId: string;
  employeeNumber: string;
  month: number; // 1-12
  year: number;
  records: DailyAttendance[];
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
  | 'half-day';

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