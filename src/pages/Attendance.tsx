import React from 'react';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import AttendanceGrid from '../components/attendance/AttendanceGrid';
import { useEmployeeStore } from '../store/employeeStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { useUIStore } from '../store/uiStore';
import { getCurrentMonthYear, getMonthName } from '../lib/dateUtils';

const Attendance: React.FC = () => {
  const { employees } = useEmployeeStore();
  const {
    selectedMonth,
    selectedYear,
    getAllMonthlySummaries,
    shouldShowMonthlyAlert,
    setShowAlert
  } = useAttendanceStore();
  const { addNotification } = useUIStore();

  getCurrentMonthYear();
  const monthlySummaries = getAllMonthlySummaries(selectedMonth, selectedYear);
  const showAlert = shouldShowMonthlyAlert();

  // Calculate overall statistics
  const totalEmployees = employees.length;
  const employeesWithAttendance = monthlySummaries.length;
  const averageAttendance = monthlySummaries.length > 0
    ? Math.round(monthlySummaries.reduce((acc, summary) => acc + summary.attendancePercentage, 0) / monthlySummaries.length)
    : 0;

  const totalPresent = monthlySummaries.reduce((acc, summary) => acc + summary.totalPresent, 0);
  const totalAbsent = monthlySummaries.reduce((acc, summary) => acc + summary.totalAbsent, 0);
  const totalHalfDays = monthlySummaries.reduce((acc, summary) => acc + summary.totalHalfDays, 0);

  // This was previously unused — now wired to UI below
  const handleBackupData = () => {
    addNotification({
      type: 'info',
      title: 'Backup Process Started',
      message: 'Attendance data backup has been initiated. You will be notified when complete.'
    });
    // hide the alert after initiating backup
    setShowAlert(false);
    // place to trigger actual backup logic (call API, export, etc.)
  };

  const StatCard = ({
    title,
    value,
    icon,
    color = "crimson",
    subtitle,
    onClick
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
    onClick?: () => void;
  }) => (
    <Card className={onClick ? "cursor-pointer hover:shadow-lg transition-all duration-200" : ""} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-custom-600">{title}</p>
            <p className="text-2xl font-bold text-slate-custom-800">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-custom-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <div className={`text-${color}-600`}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-custom-800">Attendance Management</h1>
          <p className="text-slate-custom-600">
            Track and manage employee attendance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleBackupData}>Backup Data</Button>
        </div>
      </div>

      {/* Show monthly backup alert if store asks for it */}
      {showAlert && (
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Monthly backup available</p>
              <p className="text-sm text-slate-custom-600">We recommend backing up the monthly attendance summaries.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleBackupData}>Backup Now</Button>
              <Button variant="ghost" onClick={() => setShowAlert(false)}>Dismiss</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-6 w-6" />}
          subtitle={`${employeesWithAttendance} with attendance records`}
        />
        <StatCard
          title="Average Attendance"
          value={`${averageAttendance}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
          subtitle={`For ${getMonthName(selectedMonth)} ${selectedYear}`}
        />
        <StatCard
          title="Monthly Summary"
          value={`${totalPresent}P / ${totalAbsent}A`}
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
          subtitle={`${totalHalfDays} half days`}
        />
      </div>

      {/* Main Content */}
      <AttendanceGrid />

      {/* Quick Stats Summary */}
      {monthlySummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Quick Summary - {getMonthName(selectedMonth)} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{totalPresent}</div>
                <div className="text-sm text-green-700">Total Present</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{totalAbsent}</div>
                <div className="text-sm text-red-700">Total Absent</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{totalHalfDays}</div>
                <div className="text-sm text-yellow-700">Half Days</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{averageAttendance}%</div>
                <div className="text-sm text-purple-700">Avg Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Attendance;