export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DateRange {
  startDate: string; // dd-MM-yyyy
  endDate: string; // dd-MM-yyyy
}

export interface CropperSettings {
  aspectRatio: number;
  width: number;
  height: number;
  quality: number;
}

/**
 * PrintOptions uses a generic `F` for filters. By default it's a
 * Record<string, unknown> but you can pass a more specific type
 * where you call/construct PrintOptions.
 */
export interface PrintOptions<F = Record<string, unknown>> {
  type: 'individual' | 'bulk';
  format: 'pdf' | 'html';
  includeImage: boolean;
  filters?: F;
  orientation: 'portrait' | 'landscape';
}

/**
 * ExportOptions is generic over the row type `T`. Default is
 * Record<string, unknown>, but you can pass a concrete interface
 * for stricter typing when exporting.
 */
export interface ExportOptions<T = Record<string, unknown>> {
  format: 'excel' | 'csv' | 'pdf';
  filename: string;
  data: T[];
  headers: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  errors: ValidationError[];
  isDirty: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  currentPage: string;
  dialogOpen: boolean;
  selectedEmployee: string | null;
}


export interface DatabaseConfig {
  connectionString: string;
  database: string;
  retryAttempts: number;
  timeout: number;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
}

export interface MonthlyAlert {
  id: string;
  type: 'attendance-backup' | 'leave-backup' | 'data-cleanup';
  message: string;
  month: number;
  year: number;
  isResolved: boolean;
  createdAt: Date;
}
