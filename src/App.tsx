import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import Attendance from './pages/Attendance';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useUIStore } from './store/uiStore';
import { useEmployeeStore } from './store/employeeStore';
import { useAttendanceStore } from './store/attendanceStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from './lib/utils';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Type definition for notifications
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

// Sample data for demonstration
const sampleEmployees = [
  {
    _id: '1',
    employeeNumber: 'EMP001',
    image: null,
    fullName: 'John Doe',
    designation: 'District Officer' as const,
    ministry: 'Ministry of Public Administration',
    gender: 'Male' as const,
    personalAddress: {
      line1: '123 Main Street',
      line2: 'Negombo',
      line3: 'Western Province'
    },
    mobileNumber: '077 123 4567',
    emailAddress: 'john.doe@gov.lk',
    nicNumber: '199012345678',
    dateOfBirth: '12-01-1990',
    age: 34,
    firstAppointmentDate: '15-03-2020',
    gradeAppointmentDate: {
      gradeIII: '15-03-2020',
      gradeII: '15-03-2022'
    },
    appointmentLetterNo: 'AL/2020/001',
    incrementDate: '15-03',
    wopNumber: 'WOP123',
    educationalQualification: 'Bachelor of Arts in Public Administration',
    centralProvincial: 'Central' as const,
    dateOfArrivalVDS: '15-03-2020',
    status: 'Active',
    dateOfTransfer: '',
    ebPass: true,
    serviceConfirmed: true,
    secondLanguagePassed: true,
    retiredDate: '12-01-2050',
    maritalStatus: 'Married' as const,
    salaryCode: 'M2' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    employeeNumber: 'EMP002',
    image: null,
    fullName: 'Jane Smith',
    designation: 'Management Service Officer' as const,
    ministry: 'Ministry of Education',
    gender: 'Female' as const,
    personalAddress: {
      line1: '456 Lake Road',
      line2: 'Kandy',
      line3: 'Central Province'
    },
    mobileNumber: '071 987 6543',
    emailAddress: 'jane.smith@edu.gov.lk',
    nicNumber: '198567890123',
    dateOfBirth: '23-06-1985',
    age: 39,
    firstAppointmentDate: '01-08-2018',
    gradeAppointmentDate: {
      gradeIII: '01-08-2018',
      gradeII: '01-08-2020',
      gradeI: '01-08-2023'
    },
    appointmentLetterNo: 'AL/2018/045',
    incrementDate: '01-08',
    wopNumber: 'WOP456',
    educationalQualification: 'Master of Business Administration',
    centralProvincial: 'Central' as const,
    dateOfArrivalVDS: '01-08-2018',
    status: 'Active',
    dateOfTransfer: '',
    ebPass: false,
    serviceConfirmed: true,
    secondLanguagePassed: true,
    retiredDate: '23-06-2045',
    maritalStatus: 'Single' as const,
    salaryCode: 'A1' as const,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

const App: React.FC = () => {
  const {
    currentPage,
    notifications,
    removeNotification,
    confirmDialogOpen,
    confirmDialogData,
    closeConfirmDialog
  } = useUIStore();

  const { setEmployees } = useEmployeeStore();
  const { setShowAlert } = useAttendanceStore();

  // Load sample data on app start
  useEffect(() => {
    try {
      setEmployees(sampleEmployees);

      // Show monthly alert for demonstration
      setTimeout(() => {
        setShowAlert(true);
      }, 2000);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  }, [setEmployees, setShowAlert]);

  // Render the current page based on navigation state
  const renderCurrentPage = () => {
    try {
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'employees':
          return <Employees />;
        case 'add-employee':
          return <AddEmployee />;
        case 'attendance':
          return <Attendance />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      throw error; // Let error boundary handle it
    }
  };

  // Notification component
  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case 'info':
        default:
          return <Info className="h-5 w-5 text-blue-600" />;
      }
    };

    const getBgColor = () => {
      switch (notification.type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        case 'info':
        default:
          return 'bg-blue-50 border-blue-200';
      }
    };

    return (
      <div
        className={cn(
          "flex items-start space-x-3 p-4 rounded-lg border shadow-sm transition-all duration-300",
          getBgColor()
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-custom-800">
            {notification.title}
          </h4>
          <p className="text-sm text-slate-custom-600 mt-1">
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 text-slate-custom-400 hover:text-slate-custom-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-pearl-50">
          <ErrorBoundary>
            <Layout>
              <ErrorBoundary>
                {renderCurrentPage()}
              </ErrorBoundary>
            </Layout>
          </ErrorBoundary>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
              {notifications.slice(0, 3).map((notification) => (
                <ErrorBoundary key={notification.id}>
                  <NotificationItem notification={notification} />
                </ErrorBoundary>
              ))}
              {notifications.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      // Clear all notifications after the first 3
                      notifications.slice(3).forEach(n => removeNotification(n.id));
                    }}
                  >
                    Clear {notifications.length - 3} more
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Dialog */}
          <Dialog open={confirmDialogOpen} onOpenChange={closeConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{confirmDialogData?.title}</DialogTitle>
                <DialogDescription>
                  {confirmDialogData?.message}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    confirmDialogData?.onCancel?.();
                    closeConfirmDialog();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    confirmDialogData?.onConfirm();
                    closeConfirmDialog();
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;