import { create } from 'zustand';
import { NotificationData, UIState } from '../types/common';

interface UIStore extends UIState {
  notifications: NotificationData[];

  // Modal/Dialog states
  employeeDetailsDialogOpen: boolean;
  employeeFormDialogOpen: boolean;
  attendanceDialogOpen: boolean;
  leaveApplicationDialogOpen: boolean;
  confirmDialogOpen: boolean;
  confirmDialogData: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null;

  // Loading states
  pageLoading: boolean;
  buttonLoading: string | null; // Button ID that's currently loading

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentPage: (page: string) => void;
  setSelectedEmployee: (employeeId: string | null) => void;

  // Dialog actions
  openEmployeeDetailsDialog: () => void;
  closeEmployeeDetailsDialog: () => void;
  openEmployeeFormDialog: () => void;
  closeEmployeeFormDialog: () => void;
  openAttendanceDialog: () => void;
  closeAttendanceDialog: () => void;
  openLeaveApplicationDialog: () => void;
  closeLeaveApplicationDialog: () => void;
  openConfirmDialog: (data: { title: string; message: string; onConfirm: () => void; onCancel?: () => void }) => void;
  closeConfirmDialog: () => void;

  // Loading actions
  setPageLoading: (loading: boolean) => void;
  setButtonLoading: (buttonId: string | null) => void;

  // Notification actions
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Reset
  resetUIState: () => void;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useUIStore = create<UIStore>((set, get) => ({
  theme: 'light',
  sidebarCollapsed: false,
  currentPage: 'dashboard',
  dialogOpen: false,
  selectedEmployee: null,
  notifications: [],

  // Modal states
  employeeDetailsDialogOpen: false,
  employeeFormDialogOpen: false,
  attendanceDialogOpen: false,
  leaveApplicationDialogOpen: false,
  confirmDialogOpen: false,
  confirmDialogData: null,

  // Loading states
  pageLoading: false,
  buttonLoading: null,

  setTheme: (theme) =>
    set({ theme }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (sidebarCollapsed) =>
    set({ sidebarCollapsed }),

  setCurrentPage: (currentPage) =>
    set({ currentPage }),

  setSelectedEmployee: (selectedEmployee) =>
    set({ selectedEmployee }),

  // Dialog actions
  openEmployeeDetailsDialog: () =>
    set({ employeeDetailsDialogOpen: true }),

  closeEmployeeDetailsDialog: () =>
    set({ employeeDetailsDialogOpen: false }),

  openEmployeeFormDialog: () =>
    set({ employeeFormDialogOpen: true }),

  closeEmployeeFormDialog: () =>
    set({ employeeFormDialogOpen: false }),

  openAttendanceDialog: () =>
    set({ attendanceDialogOpen: true }),

  closeAttendanceDialog: () =>
    set({ attendanceDialogOpen: false }),

  openLeaveApplicationDialog: () =>
    set({ leaveApplicationDialogOpen: true }),

  closeLeaveApplicationDialog: () =>
    set({ leaveApplicationDialogOpen: false }),

  openConfirmDialog: (confirmDialogData) =>
    set({ confirmDialogOpen: true, confirmDialogData }),

  closeConfirmDialog: () =>
    set({ confirmDialogOpen: false, confirmDialogData: null }),

  // Loading actions
  setPageLoading: (pageLoading) =>
    set({ pageLoading }),

  setButtonLoading: (buttonLoading) =>
    set({ buttonLoading }),

  // Notification actions
  addNotification: (notification) => {
    const newNotification: NotificationData = {
      ...notification,
      id: generateId(),
      timestamp: new Date()
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto-remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),

  clearNotifications: () =>
    set({ notifications: [] }),

  resetUIState: () =>
    set({
      theme: 'light',
      sidebarCollapsed: false,
      currentPage: 'dashboard',
      dialogOpen: false,
      selectedEmployee: null,
      notifications: [],
      employeeDetailsDialogOpen: false,
      employeeFormDialogOpen: false,
      attendanceDialogOpen: false,
      leaveApplicationDialogOpen: false,
      confirmDialogOpen: false,
      confirmDialogData: null,
      pageLoading: false,
      buttonLoading: null
    })
}));