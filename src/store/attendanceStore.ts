import { create } from 'zustand';
import { AttendanceRecord, DailyAttendance, LeaveApplication, MonthlyAttendanceSummary, AttendanceStatus } from '../types/attendance';
import { getCurrentMonthYear } from '../lib/dateUtils';

interface AttendanceState {
  attendanceRecords: AttendanceRecord[];
  leaveApplications: LeaveApplication[];
  selectedMonth: number;
  selectedYear: number;
  selectedEmployeeId: string | null;
  isLoading: boolean;
  error: string | null;
  showAlert: boolean;

  // Actions
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  setLeaveApplications: (applications: LeaveApplication[]) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (employeeId: string, month: number, year: number, records: DailyAttendance[]) => void;
  markAttendance: (employeeId: string, date: number, status: AttendanceStatus, notes?: string) => void;
  addLeaveApplication: (application: LeaveApplication) => void;
  updateLeaveApplication: (id: string, updates: Partial<LeaveApplication>) => void;
  approveLeave: (id: string, approvedBy: string) => void;
  rejectLeave: (id: string, reason: string) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setSelectedEmployeeId: (employeeId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowAlert: (show: boolean) => void;

  // Computed values
  getAttendanceForEmployee: (employeeId: string, month: number, year: number) => AttendanceRecord | null;
  getLeaveBalance: (employeeId: string, year: number) => number;
  getMonthlyAttendanceSummary: (employeeId: string, month: number, year: number) => MonthlyAttendanceSummary | null;
  getAllMonthlySummaries: (month: number, year: number) => MonthlyAttendanceSummary[];
  getPendingLeaveApplications: () => LeaveApplication[];
  getLeaveApplicationsForEmployee: (employeeId: string) => LeaveApplication[];
  shouldShowMonthlyAlert: () => boolean;
  clearMonthlyData: (month: number, year: number) => void;
  resetState: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => {
  const { month, year } = getCurrentMonthYear();

  return {
    attendanceRecords: [],
    leaveApplications: [],
    selectedMonth: month,
    selectedYear: year,
    selectedEmployeeId: null,
    isLoading: false,
    error: null,
    showAlert: false,

    setAttendanceRecords: (attendanceRecords) =>
      set({ attendanceRecords, error: null }),

    setLeaveApplications: (leaveApplications) =>
      set({ leaveApplications, error: null }),

    addAttendanceRecord: (record) =>
      set((state) => ({
        attendanceRecords: [...state.attendanceRecords, record],
        error: null
      })),

    updateAttendanceRecord: (employeeId, month, year, records) =>
      set((state) => {
        const existingIndex = state.attendanceRecords.findIndex(
          r => r.employeeId === employeeId && r.month === month && r.year === year
        );

        if (existingIndex >= 0) {
          const updated = [...state.attendanceRecords];
          updated[existingIndex] = {
            ...updated[existingIndex],
            records,
            updatedAt: new Date()
          };
          return { attendanceRecords: updated, error: null };
        } else {
          // Create new record
          const newRecord: AttendanceRecord = {
            employeeId,
            employeeNumber: '', // This should be filled from employee data
            month,
            year,
            records,
            leaveBalance: 42, // Default annual leave
            createdAt: new Date(),
            updatedAt: new Date()
          };
          return {
            attendanceRecords: [...state.attendanceRecords, newRecord],
            error: null
          };
        }
      }),

    markAttendance: (employeeId, date, status, notes) =>
      set((state) => {
        const { selectedMonth, selectedYear } = state;
        const recordIndex = state.attendanceRecords.findIndex(
          r => r.employeeId === employeeId && r.month === selectedMonth && r.year === selectedYear
        );

        if (recordIndex >= 0) {
          const updated = [...state.attendanceRecords];
          const record = { ...updated[recordIndex] };

          const dayIndex = record.records.findIndex(r => r.date === date);
          const dayRecord: DailyAttendance = { date, status, notes };

          if (dayIndex >= 0) {
            record.records[dayIndex] = dayRecord;
          } else {
            record.records.push(dayRecord);
          }

          // Update leave balance if it's a leave day (coerce to string for type-safety)
          const statusStr = String(status);
          if (statusStr.includes('leave') || statusStr === 'leave') {
            record.leaveBalance = Math.max(0, (record.leaveBalance ?? 0) - 1);
          }

          record.updatedAt = new Date();
          updated[recordIndex] = record;

          return { attendanceRecords: updated, error: null };
        }

        return state;
      }),

    addLeaveApplication: (application) =>
      set((state) => ({
        leaveApplications: [...state.leaveApplications, application],
        error: null
      })),

    updateLeaveApplication: (id, updates) =>
      set((state) => ({
        leaveApplications: state.leaveApplications.map(app =>
          app._id === id ? { ...app, ...updates, updatedAt: new Date() } : app
        ),
        error: null
      })),

    approveLeave: (id, approvedBy) =>
      set((state) => ({
        leaveApplications: state.leaveApplications.map(app =>
          app._id === id
            ? {
                ...app,
                status: 'approved',
                approvedBy,
                approvedDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date()
              }
            : app
        ),
        error: null
      })),

    rejectLeave: (id, reason) =>
      set((state) => ({
        leaveApplications: state.leaveApplications.map(app =>
          app._id === id
            ? {
                ...app,
                status: 'rejected',
                rejectedReason: reason,
                updatedAt: new Date()
              }
            : app
        ),
        error: null
      })),

    setSelectedMonth: (selectedMonth) =>
      set({ selectedMonth }),

    setSelectedYear: (selectedYear) =>
      set({ selectedYear }),

    setSelectedEmployeeId: (selectedEmployeeId) =>
      set({ selectedEmployeeId }),

    setLoading: (isLoading) =>
      set({ isLoading }),

    setError: (error) =>
      set({ error, isLoading: false }),

    setShowAlert: (showAlert) =>
      set({ showAlert }),

    getAttendanceForEmployee: (employeeId, month, year) => {
      const { attendanceRecords } = get();
      return attendanceRecords.find(
        r => r.employeeId === employeeId && r.month === month && r.year === year
      ) || null;
    },

    getLeaveBalance: (employeeId, year) => {
      const { attendanceRecords } = get();
      const yearRecords = attendanceRecords.filter(
        r => r.employeeId === employeeId && r.year === year
      );

      const totalLeavesTaken = yearRecords.reduce((total, record) => {
        const leaveDays = record.records.filter(day => {
          const s = String(day.status);
          return s.includes('leave') || s === 'leave';
        }).length;
        return total + leaveDays;
      }, 0);

      return Math.max(0, 42 - totalLeavesTaken);
    },

    getMonthlyAttendanceSummary: (employeeId, month, year) => {
      const record = get().getAttendanceForEmployee(employeeId, month, year);
      if (!record) return null;

      const totalWorkingDays = new Date(year, month, 0).getDate(); // Days in month
      const totalPresent = record.records.filter(r => String(r.status) === 'present').length;
      const totalAbsent = record.records.filter(r => String(r.status) === 'absent').length;
      const totalHalfDays = record.records.filter(r => String(r.status) === 'half-day').length;
      const totalLeaves = record.records.filter(r => {
        const s = String(r.status);
        return s.includes('leave') || s === 'leave';
      }).length;

      const leaveBreakdown = {
        'sick-leave': record.records.filter(r => String(r.status) === 'sick-leave').length,
        'casual-leave': record.records.filter(r => String(r.status) === 'casual-leave').length,
        'annual-leave': record.records.filter(r => String(r.status) === 'annual-leave').length,
        'emergency-leave': record.records.filter(r => String(r.status) === 'emergency-leave').length,
        'maternity-leave': record.records.filter(r => String(r.status) === 'maternity-leave').length,
        'paternity-leave': record.records.filter(r => String(r.status) === 'paternity-leave').length,
      };

      const attendancePercentage = totalWorkingDays > 0
        ? Math.round(((totalPresent + (totalHalfDays * 0.5)) / totalWorkingDays) * 100)
        : 0;

      return {
        employeeId,
        employeeNumber: record.employeeNumber,
        fullName: '', // This should be filled from employee data
        month,
        year,
        totalWorkingDays,
        totalPresent,
        totalAbsent,
        totalHalfDays,
        totalLeaves,
        leaveBreakdown,
        attendancePercentage
      };
    },

    getAllMonthlySummaries: (month, year) => {
      const { attendanceRecords } = get();
      const monthRecords = attendanceRecords.filter(r => r.month === month && r.year === year);

      return monthRecords.map(record => {
        return get().getMonthlyAttendanceSummary(record.employeeId, month, year);
      }).filter(Boolean) as MonthlyAttendanceSummary[];
    },

    getPendingLeaveApplications: () => {
      const { leaveApplications } = get();
      return leaveApplications.filter(app => app.status === 'pending');
    },

    getLeaveApplicationsForEmployee: (employeeId) => {
      const { leaveApplications } = get();
      return leaveApplications.filter(app => app.employeeId === employeeId);
    },

    shouldShowMonthlyAlert: () => {
      const now = new Date();
      const { attendanceRecords } = get();

      // Show alert if it's the last week of the month and there's attendance data
      const isLastWeek = now.getDate() > 23;
      const hasCurrentMonthData = attendanceRecords.some(r =>
        r.month === now.getMonth() + 1 && r.year === now.getFullYear()
      );

      return isLastWeek && hasCurrentMonthData;
    },

    clearMonthlyData: (month, year) =>
      set((state) => ({
        attendanceRecords: state.attendanceRecords.filter(r =>
          !(r.month === month && r.year === year)
        ),
        leaveApplications: state.leaveApplications.filter(app => {
          const appDate = new Date(app.appliedDate);
          return !(appDate.getMonth() + 1 === month && appDate.getFullYear() === year);
        }),
        error: null
      })),

    resetState: () => {
      const { month, year } = getCurrentMonthYear();
      set({
        attendanceRecords: [],
        leaveApplications: [],
        selectedMonth: month,
        selectedYear: year,
        selectedEmployeeId: null,
        isLoading: false,
        error: null,
        showAlert: false
      });
    }
  };
});
