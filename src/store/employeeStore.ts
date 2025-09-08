import { create } from "zustand";
import { Employee, EmployeeFilter } from "../types/employee";

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  error: string | null;
  filters: EmployeeFilter;
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  sortBy: keyof Employee;
  sortDirection: "asc" | "desc";

  // Actions
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<EmployeeFilter>) => void;
  clearFilters: () => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setSorting: (sortBy: keyof Employee, direction: "asc" | "desc") => void;
  getFilteredEmployees: () => Employee[];
  getPaginatedEmployees: () => Employee[];
  getTotalPages: () => number;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeeByNumber: (employeeNumber: string) => Employee | undefined;
  getUniqueMinistries: () => string[];
  resetState: () => void;
}

const initialFilters: EmployeeFilter = {};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  selectedEmployee: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
  searchTerm: "",
  currentPage: 1,
  itemsPerPage: 25,
  sortBy: "fullName",
  sortDirection: "asc",

  setEmployees: (employees) => set({ employees, error: null }),

  addEmployee: (employee) =>
    set((state) => ({
      employees: [...state.employees, employee],
      error: null,
    })),

  updateEmployee: (id, updatedEmployee) =>
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp._id === id ? { ...emp, ...updatedEmployee } : emp
      ),
      selectedEmployee:
        state.selectedEmployee?._id === id
          ? { ...state.selectedEmployee, ...updatedEmployee }
          : state.selectedEmployee,
      error: null,
    })),

  deleteEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((emp) => emp._id !== id),
      selectedEmployee:
        state.selectedEmployee?._id === id ? null : state.selectedEmployee,
      error: null,
    })),

  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),

  clearFilters: () => set({ filters: initialFilters, currentPage: 1 }),

  setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }),

  setSorting: (sortBy, sortDirection) => set({ sortBy, sortDirection }),

  getFilteredEmployees: () => {
    const { employees, filters, searchTerm, sortBy, sortDirection } = get();

    try {
      let filtered = [...employees];

      // Apply search term
      if (searchTerm && searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (emp) =>
            emp.fullName?.toLowerCase().includes(lowerSearchTerm) ||
            emp.employeeNumber?.toLowerCase().includes(lowerSearchTerm) ||
            emp.nicNumber?.toLowerCase().includes(lowerSearchTerm) ||
            emp.designation?.toLowerCase().includes(lowerSearchTerm) ||
            emp.ministry?.toLowerCase().includes(lowerSearchTerm)
        );
      }

      // Apply filters safely
      if (filters.employeeNumber && filters.employeeNumber.trim()) {
        filtered = filtered.filter((emp) =>
          emp.employeeNumber
            ?.toLowerCase()
            .includes(filters.employeeNumber!.toLowerCase())
        );
      }

      if (filters.fullName && filters.fullName.trim()) {
        filtered = filtered.filter((emp) =>
          emp.fullName?.toLowerCase().includes(filters.fullName!.toLowerCase())
        );
      }

      if (filters.designation) {
        filtered = filtered.filter(
          (emp) => emp.designation === filters.designation
        );
      }

      if (filters.ministry && filters.ministry.trim()) {
        filtered = filtered.filter((emp) =>
          emp.ministry?.toLowerCase().includes(filters.ministry!.toLowerCase())
        );
      }

      if (filters.nicNumber && filters.nicNumber.trim()) {
        filtered = filtered.filter((emp) =>
          emp.nicNumber?.toLowerCase().includes(filters.nicNumber!.toLowerCase())
        );
      }

      if (filters.gender) {
        filtered = filtered.filter((emp) => emp.gender === filters.gender);
      }

      if (filters.salaryCode) {
        filtered = filtered.filter(
          (emp) => emp.salaryCode === filters.salaryCode
        );
      }

      // Age range filter with safety checks
      if (filters.ageRange) {
        const { min, max } = filters.ageRange;
        filtered = filtered.filter((emp) => {
          const empAge = emp.age;
          if (typeof empAge !== 'number' || isNaN(empAge)) return true; // Skip invalid ages

          const minAge = typeof min === 'number' && !isNaN(min) ? min : 0;
          const maxAge = typeof max === 'number' && !isNaN(max) ? max : 100;

          return empAge >= minAge && empAge <= maxAge;
        });
      }

      // Apply sorting safely
      filtered.sort((a, b) => {
        try {
          const aRaw = a[sortBy] as unknown;
          const bRaw = b[sortBy] as unknown;

          // Handle null/undefined
          const aNull = aRaw === null || aRaw === undefined;
          const bNull = bRaw === null || bRaw === undefined;
          if (aNull && bNull) return 0;
          if (aNull) return sortDirection === "asc" ? -1 : 1;
          if (bNull) return sortDirection === "asc" ? 1 : -1;

          // Numbers
          if (typeof aRaw === "number" && typeof bRaw === "number") {
            const diff = aRaw - bRaw;
            return sortDirection === "asc" ? Math.sign(diff) : Math.sign(-diff);
          }

          // Dates: either Date objects or ISO-like date strings
          const toDate = (v: unknown): Date | null => {
            if (v instanceof Date) return v;
            if (typeof v === "string") {
              const parsed = new Date(v);
              if (!Number.isNaN(parsed.getTime())) return parsed;
            }
            return null;
          };

          const aDate = toDate(aRaw);
          const bDate = toDate(bRaw);
          if (aDate && bDate) {
            const diff = aDate.getTime() - bDate.getTime();
            return sortDirection === "asc" ? Math.sign(diff) : Math.sign(-diff);
          }

          // Fallback: string compare (case-insensitive)
          const aStr = String(aRaw || '').toLowerCase();
          const bStr = String(bRaw || '').toLowerCase();
          if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
          if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
          return 0;
        } catch (error) {
          console.warn('Sorting error:', error);
          return 0;
        }
      });

      return filtered;
    } catch (error) {
      console.error('Error in getFilteredEmployees:', error);
      return employees; // Return original employees if filtering fails
    }
  },

  getPaginatedEmployees: () => {
    try {
      const { currentPage, itemsPerPage } = get();
      const filtered = get().getFilteredEmployees();

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      return filtered.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error in getPaginatedEmployees:', error);
      return [];
    }
  },

  getTotalPages: () => {
    try {
      const { itemsPerPage } = get();
      const filtered = get().getFilteredEmployees();

      return Math.ceil(filtered.length / itemsPerPage);
    } catch (error) {
      console.error('Error in getTotalPages:', error);
      return 1;
    }
  },

  getEmployeeById: (id) => {
    try {
      const { employees } = get();
      return employees.find((emp) => emp._id === id);
    } catch (error) {
      console.error('Error in getEmployeeById:', error);
      return undefined;
    }
  },

  getEmployeeByNumber: (employeeNumber) => {
    try {
      const { employees } = get();
      return employees.find((emp) => emp.employeeNumber === employeeNumber);
    } catch (error) {
      console.error('Error in getEmployeeByNumber:', error);
      return undefined;
    }
  },

  getUniqueMinistries: () => {
    try {
      const { employees } = get();
      const ministries = employees
        .map((emp) => emp.ministry?.trim())
        .filter(Boolean);
      return [...new Set(ministries)].sort();
    } catch (error) {
      console.error('Error in getUniqueMinistries:', error);
      return [];
    }
  },

  resetState: () =>
    set({
      employees: [],
      selectedEmployee: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      searchTerm: "",
      currentPage: 1,
      itemsPerPage: 25,
      sortBy: "fullName",
      sortDirection: "asc",
    }),
}));