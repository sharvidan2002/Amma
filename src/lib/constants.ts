import { Designation, SalaryCode, AttendanceStatus, LeaveType } from '../types/employee';

// Employee Constants
export const DESIGNATIONS: Designation[] = [
  'District Officer',
  'Asst.District Officer',
  'Management Service Officer',
  'Development Officer',
  'Extension officer',
  'Office employee service',
  'Garden labour'
];

export const SALARY_CODES: SalaryCode[] = [
  'M1', 'M2', 'M3', 'A1', 'A2', 'B3', 'C3', 'C4'
];

export const GENDERS = ['Male', 'Female'] as const;

export const MARITAL_STATUS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed'
] as const;

export const CENTRAL_PROVINCIAL = ['Central', 'Provincial'] as const;

// Attendance Constants
export const ATTENDANCE_STATUSES: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'present', label: 'Present', color: 'bg-green-500' },
  { value: 'absent', label: 'Absent', color: 'bg-red-500' },
  { value: 'half-day', label: 'Half Day', color: 'bg-yellow-500' },
  { value: 'leave', label: 'Leave', color: 'bg-blue-500' },
  { value: 'sick-leave', label: 'Sick Leave', color: 'bg-purple-500' },
  { value: 'casual-leave', label: 'Casual Leave', color: 'bg-indigo-500' },
  { value: 'annual-leave', label: 'Annual Leave', color: 'bg-cyan-500' },
  { value: 'emergency-leave', label: 'Emergency Leave', color: 'bg-orange-500' }
];

export const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'sick-leave', label: 'Sick Leave' },
  { value: 'casual-leave', label: 'Casual Leave' },
  { value: 'annual-leave', label: 'Annual Leave' },
  { value: 'emergency-leave', label: 'Emergency Leave' },
  { value: 'maternity-leave', label: 'Maternity Leave' },
  { value: 'paternity-leave', label: 'Paternity Leave' }
];

// Application Constants
export const APP_CONFIG = {
  name: 'Employee Management System',
  version: '1.0.0',
  maxLeavePerYear: 42,
  retirementAge: 60,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  imageAspectRatio: 4/3,
  defaultImageWidth: 400,
  defaultImageHeight: 300,
  supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// Form Field Categories
export const EMPLOYEE_FORM_SECTIONS = {
  basic: {
    title: 'Basic Information',
    fields: ['employeeNumber', 'image', 'fullName', 'designation', 'ministry', 'gender']
  },
  contact: {
    title: 'Contact Information',
    fields: ['personalAddress', 'mobileNumber', 'emailAddress']
  },
  identification: {
    title: 'Identification & Personal Details',
    fields: ['nicNumber', 'dateOfBirth', 'age', 'maritalStatus']
  },
  employment: {
    title: 'Employment Information',
    fields: ['firstAppointmentDate', 'gradeAppointmentDate', 'appointmentLetterNo',
             'incrementDate', 'wopNumber', 'salaryCode', 'centralProvincial']
  },
  additional: {
    title: 'Additional Information',
    fields: ['educationalQualification', 'dateOfArrivalVDS', 'status', 'dateOfTransfer',
             'ebPass', 'serviceConfirmed', 'secondLanguagePassed', 'retiredDate']
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  employeeNumber: {
    required: true,
    pattern: /^[A-Z0-9]+$/,
    message: 'Employee number must contain only letters and numbers'
  },
  mobileNumber: {
    required: true,
    pattern: /^0\d{2}\s\d{3}\s\d{4}$/,
    message: 'Mobile number format: 012 345 6789'
  },
  emailAddress: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  nicNumber: {
    required: true,
    message: 'Valid NIC number is required'
  },
  fullName: {
    required: true,
    minLength: 2,
    message: 'Full name is required (minimum 2 characters)'
  }
};

// Print Settings
export const PRINT_SETTINGS = {
  individual: {
    paperSize: 'A4',
    orientation: 'portrait',
    margins: '20mm',
    fontSize: '12px'
  },
  bulk: {
    paperSize: 'A4',
    orientation: 'landscape',
    margins: '15mm',
    fontSize: '10px'
  }
};

// Date Formats
export const DATE_FORMATS = {
  display: 'dd-MM-yyyy',
  storage: 'yyyy-MM-dd',
  increment: 'dd-MM',
  api: 'ISO'
};

// UI Constants
export const UI_CONSTANTS = {
  sidebarWidth: '280px',
  sidebarCollapsedWidth: '80px',
  headerHeight: '64px',
  cardBorderRadius: '12px',
  animationDuration: '200ms'
};

// Color Palette
export const COLORS = {
  primary: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  pearl: {
    50: '#fefefe',
    100: '#fdfdfd',
    200: '#fafafa',
    300: '#f7f7f7'
  },
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// MongoDB Settings
export const DB_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  connectionTimeout: 30000,
  collections: {
    employees: 'employees',
    attendance: 'attendance',
    leaves: 'leaves',
    settings: 'settings'
  }
};

// File Export Settings
export const EXPORT_CONFIG = {
  excel: {
    sheetName: 'Employee Data',
    maxRowsPerSheet: 65000
  },
  pdf: {
    pageSize: 'A4',
    orientation: 'landscape',
    fontSize: 8
  },
  csv: {
    delimiter: ',',
    encoding: 'utf-8'
  }
};