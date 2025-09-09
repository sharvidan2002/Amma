import { create } from 'zustand';
import { AttendanceRecord, DailyAttendance, MonthlyAttendanceSummary, AttendanceStatus } from '../types/attendance';
import { getCurrentMonthYear } from '../lib/dateUtils';

interface AttendanceState {
  attendanceRecords: AttendanceRecord[];
  selectedMonth: number;
  selectedYear: number;
  selectedEmployeeId: string | null;
  isLoading: boolean;
  error: string | null;
  showAlert: boolean;

  // Actions
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (employeeId: string, month: number, year: number, records: DailyAttendance[]) => void;
  markAttendance: (employeeId: string, date: number, status: AttendanceStatus, notes?: string) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setSelectedEmployeeId: (employeeId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowAlert: (show: boolean) => void;

  // Computed values
  getAttendanceForEmployee: (employeeId: string, month: number, year: number) => AttendanceRecord | null;
  getMonthlyAttendanceSummary: (employeeId: string, month: number, year: number) => MonthlyAttendanceSummary | null;
  getAllMonthlySummaries: (month: number, year: number) => MonthlyAttendanceSummary[];
  shouldShowMonthlyAlert: () => boolean;
  clearMonthlyData: (month: number, year: number) => void;
  resetState: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => {
  const { month, year } = getCurrentMonthYear();

  return {
    attendanceRecords: [],
    selectedMonth: month,
    selectedYear: year,
    selectedEmployeeId: null,
    isLoading: false,
    error: null,
    showAlert: false,

    setAttendanceRecords: (attendanceRecords) =>
      set({ attendanceRecords, error: null }),

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

          record.updatedAt = new Date();
          updated[recordIndex] = record;

          return { attendanceRecords: updated, error: null };
        }

        return state;
      }),

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

    getMonthlyAttendanceSummary: (employeeId, month, year) => {
      const record = get().getAttendanceForEmployee(employeeId, month, year);
      if (!record) return null;

      const totalWorkingDays = new Date(year, month, 0).getDate(); // Days in month
      const totalPresent = record.records.filter(r => r.status === 'present').length;
      const totalAbsent = record.records.filter(r => r.status === 'absent').length;
      const totalHalfDays = record.records.filter(r => r.status === 'half-day').length;

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
        error: null
      })),

    resetState: () => {
      const { month, year } = getCurrentMonthYear();
      set({
        attendanceRecords: [],
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