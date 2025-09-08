import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Employee, EmployeeFilter } from '../types/employee';
import { ApiResponse, PaginatedResponse } from '../types/common';
import { invoke } from '@tauri-apps/api/tauri';

// Query Keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters?: EmployeeFilter) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  search: (query: string) => [...employeeKeys.all, 'search', query] as const,
};

// API functions
export const employeeApi = {
  getEmployees: async (filters?: EmployeeFilter, pagination?: any): Promise<PaginatedResponse<Employee>> => {
    return await invoke('get_employees', { filter: filters, pagination });
  },

  getEmployeeById: async (id: string): Promise<ApiResponse<Employee>> => {
    return await invoke('get_employee_by_id', { id });
  },

  createEmployee: async (employee: Employee): Promise<ApiResponse<Employee>> => {
    return await invoke('create_employee', { request: { employee } });
  },

  updateEmployee: async (id: string, employee: Employee): Promise<ApiResponse<Employee>> => {
    return await invoke('update_employee', { id, request: { employee } });
  },

  deleteEmployee: async (id: string): Promise<ApiResponse<void>> => {
    return await invoke('delete_employee', { id });
  },

  searchEmployees: async (query: string, pagination?: any): Promise<PaginatedResponse<Employee>> => {
    return await invoke('search_employees', { query, pagination });
  },
};

// Hooks
export const useEmployees = (filters?: EmployeeFilter, pagination?: any) => {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeApi.getEmployees(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeApi.getEmployeeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchEmployees = (query: string, pagination?: any) => {
  return useQuery({
    queryKey: employeeKeys.search(query),
    queryFn: () => employeeApi.searchEmployees(query, pagination),
    enabled: query.length > 2, // Only search with 3+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.createEmployee,
    onSuccess: () => {
      // Invalidate and refetch employee lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employee }: { id: string; employee: Employee }) =>
      employeeApi.updateEmployee(id, employee),
    onSuccess: (data, variables) => {
      // Invalidate lists and update specific employee cache
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onSuccess: (data, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

// Utility hooks
export const useEmployeeStats = () => {
  const { data: employees } = useEmployees();

  if (!employees?.data) {
    return {
      total: 0,
      active: 0,
      confirmed: 0,
      byDesignation: {},
      byGender: {},
      avgAge: 0,
    };
  }

  const stats = {
    total: employees.data.length,
    active: employees.data.filter(emp => emp.status === 'Active').length,
    confirmed: employees.data.filter(emp => emp.serviceConfirmed).length,
    byDesignation: {} as Record<string, number>,
    byGender: {} as Record<string, number>,
    avgAge: 0,
  };

  // Calculate designation breakdown
  employees.data.forEach(emp => {
    stats.byDesignation[emp.designation] = (stats.byDesignation[emp.designation] || 0) + 1;
    stats.byGender[emp.gender] = (stats.byGender[emp.gender] || 0) + 1;
  });

  // Calculate average age
  if (employees.data.length > 0) {
    const totalAge = employees.data.reduce((sum, emp) => sum + emp.age, 0);
    stats.avgAge = Math.round(totalAge / employees.data.length);
  }

  return stats;
};

export const useEmployeeValidation = () => {
  const { data: employees } = useEmployees();

  const validateEmployeeNumber = (employeeNumber: string, excludeId?: string): boolean => {
    if (!employees?.data) return true;

    return !employees.data.some(emp =>
      emp.employeeNumber === employeeNumber && emp._id !== excludeId
    );
  };

  const validateNICNumber = (nicNumber: string, excludeId?: string): boolean => {
    if (!employees?.data) return true;

    return !employees.data.some(emp =>
      emp.nicNumber === nicNumber && emp._id !== excludeId
    );
  };

  const validateEmail = (email: string, excludeId?: string): boolean => {
    if (!employees?.data) return true;

    return !employees.data.some(emp =>
      emp.emailAddress.toLowerCase() === email.toLowerCase() && emp._id !== excludeId
    );
  };

  return {
    validateEmployeeNumber,
    validateNICNumber,
    validateEmail,
  };
};