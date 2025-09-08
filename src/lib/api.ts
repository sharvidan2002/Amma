import { invoke } from '@tauri-apps/api/tauri';
import { Employee, EmployeeFilter } from '../types/employee';
import { AttendanceRecord, LeaveApplication, AttendanceFilter } from '../types/attendance';
import { ApiResponse, PaginatedResponse, PrintOptions, ExportOptions } from '../types/common';

/**
 * API client for Tauri backend commands
 * This module provides a centralized interface for all backend operations
 */

// Employee API
export const employeeApi = {
  /**
   * Get all employees with optional filtering and pagination
   */
  async getEmployees(
    filter?: EmployeeFilter,
    pagination?: any
  ): Promise<PaginatedResponse<Employee>> {
    try {
      const response = await invoke('get_employees', { filter, pagination });
      return response as PaginatedResponse<Employee>;
    } catch (error) {
      console.error('Failed to get employees:', error);
      throw new Error(`Failed to fetch employees: ${error}`);
    }
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    try {
      const response = await invoke('get_employee_by_id', { id });
      return response as ApiResponse<Employee>;
    } catch (error) {
      console.error('Failed to get employee:', error);
      throw new Error(`Failed to fetch employee: ${error}`);
    }
  },

  /**
   * Create new employee
   */
  async createEmployee(employee: Employee): Promise<ApiResponse<Employee>> {
    try {
      const response = await invoke('create_employee', {
        request: { employee }
      });
      return response as ApiResponse<Employee>;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw new Error(`Failed to create employee: ${error}`);
    }
  },

  /**
   * Update existing employee
   */
  async updateEmployee(id: string, employee: Employee): Promise<ApiResponse<Employee>> {
    try {
      const response = await invoke('update_employee', {
        id,
        request: { employee }
      });
      return response as ApiResponse<Employee>;
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw new Error(`Failed to update employee: ${error}`);
    }
  },

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await invoke('delete_employee', { id });
      return response as ApiResponse<void>;
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw new Error(`Failed to delete employee: ${error}`);
    }
  },

  /**
   * Search employees
   */
  async searchEmployees(
    query: string,
    pagination?: any
  ): Promise<PaginatedResponse<Employee>> {
    try {
      const response = await invoke('search_employees', { query, pagination });
      return response as PaginatedResponse<Employee>;
    } catch (error) {
      console.error('Failed to search employees:', error);
      throw new Error(`Failed to search employees: ${error}`);
    }
  },
};

// Attendance API
export const attendanceApi = {
  /**
   * Get attendance records
   */
  async getAttendanceRecords(filter?: AttendanceFilter): Promise<AttendanceRecord[]> {
    try {
      const response = await invoke('get_attendance_records', { filter });
      return response as AttendanceRecord[];
    } catch (error) {
      console.error('Failed to get attendance records:', error);
      throw new Error(`Failed to fetch attendance records: ${error}`);
    }
  },

  /**
   * Create attendance record
   */
  async createAttendanceRecord(request: {
    employeeId: string;
    month: number;
    year: number;
    records: any[];
  }): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const response = await invoke('create_attendance_record', { request });
      return response as ApiResponse<AttendanceRecord>;
    } catch (error) {
      console.error('Failed to create attendance record:', error);
      throw new Error(`Failed to create attendance record: ${error}`);
    }
  },

  /**
   * Update attendance record
   */
  async updateAttendanceRecord(request: {
    employeeId: string;
    date: number;
    status: string;
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const response = await invoke('update_attendance_record', { request });
      return response as ApiResponse<AttendanceRecord>;
    } catch (error) {
      console.error('Failed to update attendance record:', error);
      throw new Error(`Failed to update attendance record: ${error}`);
    }
  },

  /**
   * Delete attendance record
   */
  async deleteAttendanceRecord(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await invoke('delete_attendance_record', { id });
      return response as ApiResponse<void>;
    } catch (error) {
      console.error('Failed to delete attendance record:', error);
      throw new Error(`Failed to delete attendance record: ${error}`);
    }
  },

  /**
   * Get monthly summary
   */
  async getMonthlySummary(month: number, year: number): Promise<any> {
    try {
      const response = await invoke('get_monthly_summary', { month, year });
      return response;
    } catch (error) {
      console.error('Failed to get monthly summary:', error);
      throw new Error(`Failed to fetch monthly summary: ${error}`);
    }
  },
};

// Leave API
export const leaveApi = {
  /**
   * Get leave applications
   */
  async getLeaveApplications(
    employeeId?: string,
    status?: string
  ): Promise<LeaveApplication[]> {
    try {
      const response = await invoke('get_leave_applications', { employeeId, status });
      return response as LeaveApplication[];
    } catch (error) {
      console.error('Failed to get leave applications:', error);
      throw new Error(`Failed to fetch leave applications: ${error}`);
    }
  },

  /**
   * Create leave application
   */
  async createLeaveApplication(
    leaveApplication: LeaveApplication
  ): Promise<ApiResponse<LeaveApplication>> {
    try {
      const response = await invoke('create_leave_application', {
        request: { leaveApplication }
      });
      return response as ApiResponse<LeaveApplication>;
    } catch (error) {
      console.error('Failed to create leave application:', error);
      throw new Error(`Failed to create leave application: ${error}`);
    }
  },

  /**
   * Update leave application
   */
  async updateLeaveApplication(id: string, request: {
    status: string;
    approvedBy?: string;
    rejectedReason?: string;
  }): Promise<ApiResponse<LeaveApplication>> {
    try {
      const response = await invoke('update_leave_application', { id, request });
      return response as ApiResponse<LeaveApplication>;
    } catch (error) {
      console.error('Failed to update leave application:', error);
      throw new Error(`Failed to update leave application: ${error}`);
    }
  },

  /**
   * Approve leave application
   */
  async approveLeaveApplication(
    id: string,
    approvedBy: string
  ): Promise<ApiResponse<LeaveApplication>> {
    try {
      const response = await invoke('approve_leave_application', { id, approvedBy });
      return response as ApiResponse<LeaveApplication>;
    } catch (error) {
      console.error('Failed to approve leave application:', error);
      throw new Error(`Failed to approve leave application: ${error}`);
    }
  },

  /**
   * Reject leave application
   */
  async rejectLeaveApplication(
    id: string,
    reason: string
  ): Promise<ApiResponse<LeaveApplication>> {
    try {
      const response = await invoke('reject_leave_application', { id, reason });
      return response as ApiResponse<LeaveApplication>;
    } catch (error) {
      console.error('Failed to reject leave application:', error);
      throw new Error(`Failed to reject leave application: ${error}`);
    }
  },
};

// Print & Export API
export const printApi = {
  /**
   * Generate individual employee report
   */
  async generateEmployeeReport(
    employeeId: string,
    options: PrintOptions
  ): Promise<ApiResponse<string>> {
    try {
      const response = await invoke('generate_employee_report', { employeeId, options });
      return response as ApiResponse<string>;
    } catch (error) {
      console.error('Failed to generate employee report:', error);
      throw new Error(`Failed to generate employee report: ${error}`);
    }
  },

  /**
   * Generate bulk employee report
   */
  async generateBulkReport(
    employeeIds: string[],
    options: PrintOptions
  ): Promise<ApiResponse<string>> {
    try {
      const response = await invoke('generate_bulk_report', { employeeIds, options });
      return response as ApiResponse<string>;
    } catch (error) {
      console.error('Failed to generate bulk report:', error);
      throw new Error(`Failed to generate bulk report: ${error}`);
    }
  },

  /**
   * Generate attendance report
   */
  async generateAttendanceReport(
    month: number,
    year: number,
    options: PrintOptions
  ): Promise<ApiResponse<string>> {
    try {
      const response = await invoke('generate_attendance_report', { month, year, options });
      return response as ApiResponse<string>;
    } catch (error) {
      console.error('Failed to generate attendance report:', error);
      throw new Error(`Failed to generate attendance report: ${error}`);
    }
  },

  /**
   * Export to Excel
   */
  async exportToExcel(
    data: any,
    options: ExportOptions
  ): Promise<ApiResponse<string>> {
    try {
      const response = await invoke('export_to_excel', { data, options });
      return response as ApiResponse<string>;
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      throw new Error(`Failed to export to Excel: ${error}`);
    }
  },

  /**
   * Export to CSV
   */
  async exportToCSV(
    data: any,
    options: ExportOptions
  ): Promise<ApiResponse<string>> {
    try {
      const response = await invoke('export_to_csv', { data, options });
      return response as ApiResponse<string>;
    } catch (error) {
      console.error('Failed to export to CSV:', error);
      throw new Error(`Failed to export to CSV: ${error}`);
    }
  },
};

// System API
export const systemApi = {
  /**
   * Backup monthly data
   */
  async backupMonthlyData(
    month: number,
    year: number
  ): Promise<ApiResponse<string>> {
    try {
      const response = await invoke('backup_monthly_data', { month, year });
      return response as ApiResponse<string>;
    } catch (error) {
      console.error('Failed to backup monthly data:', error);
      throw new Error(`Failed to backup monthly data: ${error}`);
    }
  },

  /**
   * Clear monthly data
   */
  async clearMonthlyData(
    month: number,
    year: number
  ): Promise<ApiResponse<string>> {
    try {
      const response = await invoke('clear_monthly_data', { month, year });
      return response as ApiResponse<string>;
    } catch (error) {
      console.error('Failed to clear monthly data:', error);
      throw new Error(`Failed to clear monthly data: ${error}`);
    }
  },

  /**
   * Get application info
   */
  async getAppInfo(): Promise<any> {
    try {
      const response = await invoke('get_app_info');
      return response;
    } catch (error) {
      console.error('Failed to get app info:', error);
      throw new Error(`Failed to get app info: ${error}`);
    }
  },
};

// Utility functions
export const apiUtils = {
  /**
   * Handle API errors consistently
   */
  handleApiError(error: any, operation: string): Error {
    console.error(`API Error in ${operation}:`, error);

    if (typeof error === 'string') {
      return new Error(error);
    }

    if (error?.message) {
      return new Error(error.message);
    }

    return new Error(`Failed to ${operation}`);
  },

  /**
   * Validate API response
   */
  validateResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.error || 'API request failed');
    }

    if (response.data === undefined || response.data === null) {
      throw new Error('No data returned from API');
    }

    return response.data;
  },

  /**
   * Create safe API wrapper
   */
  safeApiCall<T>(
    apiCall: () => Promise<T>,
    operation: string
  ): Promise<T> {
    return apiCall().catch(error => {
      throw this.handleApiError(error, operation);
    });
  },
};

// Combined API object for easy imports
export const api = {
  employees: employeeApi,
  attendance: attendanceApi,
  leaves: leaveApi,
  print: printApi,
  system: systemApi,
  utils: apiUtils,
};

export default api;