import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AttendanceRecord,
  LeaveApplication,
  MonthlyAttendanceSummary,
  AttendanceFilter,
  AttendanceStatus,
  LeaveType,
  LeaveStatus
} from '../types/attendance';
import { ApiResponse } from '../types/common';
import { invoke } from '@tauri-apps/api/tauri';

// Query Keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  records: () => [...attendanceKeys.all, 'records'] as const,
  record: (filters?: AttendanceFilter) => [...attendanceKeys.records(), { filters }] as const,
  summary: (month: number, year: number) => [...attendanceKeys.all, 'summary', month, year] as const,
  leaves: () => [...attendanceKeys.all, 'leaves'] as const,
  leave: (employeeId?: string, status?: LeaveStatus) => [...attendanceKeys.leaves(), { employeeId, status }] as const,
};

// API functions
export const attendanceApi = {
  getAttendanceRecords: async (filter?: AttendanceFilter): Promise<AttendanceRecord[]> => {
    return await invoke('get_attendance_records', { filter });
  },

  createAttendanceRecord: async (request: {
    employeeId: string;
    month: number;
    year: number;
    records: any[];
  }): Promise<ApiResponse<AttendanceRecord>> => {
    return await invoke('create_attendance_record', { request });
  },

  updateAttendanceRecord: async (request: {
    employeeId: string;
    date: number;
    status: AttendanceStatus;
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> => {
    return await invoke('update_attendance_record', { request });
  },

  deleteAttendanceRecord: async (id: string): Promise<ApiResponse<void>> => {
    return await invoke('delete_attendance_record', { id });
  },

  getMonthlySummary: async (month: number, year: number): Promise<ApiResponse<MonthlyAttendanceSummary[]>> => {
    return await invoke('get_monthly_summary', { month, year });
  },

  getLeaveApplications: async (employeeId?: string, status?: LeaveStatus): Promise<LeaveApplication[]> => {
    return await invoke('get_leave_applications', { employeeId, status });
  },

  createLeaveApplication: async (leaveApplication: LeaveApplication): Promise<ApiResponse<LeaveApplication>> => {
    return await invoke('create_leave_application', { request: { leaveApplication } });
  },

  updateLeaveApplication: async (id: string, request: {
    status: LeaveStatus;
    approvedBy?: string;
    rejectedReason?: string;
  }): Promise<ApiResponse<LeaveApplication>> => {
    return await invoke('update_leave_application', { id, request });
  },

  approveLeaveApplication: async (id: string, approvedBy: string): Promise<ApiResponse<LeaveApplication>> => {
    return await invoke('approve_leave_application', { id, approvedBy });
  },

  rejectLeaveApplication: async (id: string, reason: string): Promise<ApiResponse<LeaveApplication>> => {
    return await invoke('reject_leave_application', { id, reason });
  },

  backupMonthlyData: async (month: number, year: number): Promise<ApiResponse<string>> => {
    return await invoke('backup_monthly_data', { month, year });
  },

  clearMonthlyData: async (month: number, year: number): Promise<ApiResponse<string>> => {
    return await invoke('clear_monthly_data', { month, year });
  },
};

// Hooks
export const useAttendanceRecords = (filter?: AttendanceFilter) => {
  return useQuery({
    queryKey: attendanceKeys.record(filter),
    queryFn: () => attendanceApi.getAttendanceRecords(filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useMonthlySummary = (month: number, year: number) => {
  return useQuery({
    queryKey: attendanceKeys.summary(month, year),
    queryFn: () => attendanceApi.getMonthlySummary(month, year),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeaveApplications = (employeeId?: string, status?: LeaveStatus) => {
  return useQuery({
    queryKey: attendanceKeys.leave(employeeId, status),
    queryFn: () => attendanceApi.getLeaveApplications(employeeId, status),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateAttendanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.createAttendanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() });
    },
  });
};

export const useUpdateAttendanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.updateAttendanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() });
    },
  });
};

export const useCreateLeaveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.createLeaveApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.leaves() });
    },
  });
};

export const useUpdateLeaveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: any }) =>
      attendanceApi.updateLeaveApplication(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.leaves() });
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) =>
      attendanceApi.approveLeaveApplication(id, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.leaves() });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      attendanceApi.rejectLeaveApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.leaves() });
    },
  });
};

export const useBackupMonthlyData = () => {
  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      attendanceApi.backupMonthlyData(month, year),
  });
};

export const useClearMonthlyData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      attendanceApi.clearMonthlyData(month, year),
    onSuccess: () => {
      // Invalidate all attendance-related queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
};

// Utility hooks
export const useAttendanceStats = (month: number, year: number) => {
  const { data: summaries } = useMonthlySummary(month, year);

  if (!summaries?.data) {
    return {
      totalEmployees: 0,
      averageAttendance: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLeaves: 0,
      totalHalfDays: 0,
      attendanceRate: 0,
    };
  }

  const stats = summaries.data.reduce(
    (acc, summary) => {
      acc.totalPresent += summary.totalPresent;
      acc.totalAbsent += summary.totalAbsent;
      acc.totalLeaves += summary.totalLeaves;
      acc.totalHalfDays += summary.totalHalfDays;
      acc.attendanceRate += summary.attendancePercentage;
      return acc;
    },
    {
      totalEmployees: summaries.data.length,
      averageAttendance: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLeaves: 0,
      totalHalfDays: 0,
      attendanceRate: 0,
    }
  );

  stats.averageAttendance = summaries.data.length > 0
    ? Math.round(stats.attendanceRate / summaries.data.length)
    : 0;

  return stats;
};

export const useEmployeeAttendance = (employeeId: string, month: number, year: number) => {
  const { data: records } = useAttendanceRecords({
    employeeNumber: employeeId,
    month,
    year,
  });

  const employeeRecord = records?.find(record =>
    record.employeeId === employeeId &&
    record.month === month &&
    record.year === year
  );

  const getAttendanceForDate = (date: number) => {
    return employeeRecord?.records.find(record => record.date === date);
  };

  const markAttendance = useUpdateAttendanceRecord();

  const handleMarkAttendance = async (date: number, status: AttendanceStatus, notes?: string) => {
    await markAttendance.mutateAsync({
      employeeId,
      date,
      status,
      notes,
    });
  };

  return {
    attendanceRecord: employeeRecord,
    getAttendanceForDate,
    markAttendance: handleMarkAttendance,
    isLoading: markAttendance.isPending,
  };
};

export const useLeaveBalance = (employeeId: string, year: number) => {
  const { data: records } = useAttendanceRecords({
    employeeNumber: employeeId,
    year,
  });

  const calculateLeaveBalance = () => {
    if (!records) return 42; // Default annual leave

    const yearRecords = records.filter(record =>
      record.employeeId === employeeId && record.year === year
    );

    const totalLeavesTaken = yearRecords.reduce((total, record) => {
      const leaveDays = record.records.filter(day =>
        day.status.includes('leave') || day.status === 'leave'
      ).length;
      return total + leaveDays;
    }, 0);

    return Math.max(0, 42 - totalLeavesTaken);
  };

  return {
    leaveBalance: calculateLeaveBalance(),
    maxLeave: 42,
  };
};