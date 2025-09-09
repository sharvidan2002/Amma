import React, { useState } from 'react';
import { Calendar, Users, TrendingUp, Clock, AlertCircle, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AttendanceGrid from '../components/attendance/AttendanceGrid';
import LeaveManagement from '../components/attendance/LeaveManagement';
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
    getPendingLeaveApplications,
    setShowAlert
  } = useAttendanceStore();
  const { addNotification } = useUIStore();

  const [activeTab, setActiveTab] = useState('attendance');

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const monthlySummaries = getAllMonthlySummaries(selectedMonth, selectedYear);
  const pendingLeaves = getPendingLeaveApplications();
  const showAlert = shouldShowMonthlyAlert();

  // Calculate overall statistics
  const totalEmployees = employees.length;
  const employeesWithAttendance = monthlySummaries.length;
  const averageAttendance = monthlySummaries.length > 0
    ? Math.round(monthlySummaries.reduce((acc, summary) => acc + summary.attendancePercentage, 0) / monthlySummaries.length)
    : 0;

  const totalPresent = monthlySummaries.reduce((acc, summary) => acc + summary.totalPresent, 0);
  const totalAbsent = monthlySummaries.reduce((acc, summary) => acc + summary.totalAbsent, 0);
  const totalLeaves = monthlySummaries.reduce((acc, summary) => acc + summary.totalLeaves, 0);
  const totalHalfDays = monthlySummaries.reduce((acc, summary) => acc + summary.totalHalfDays, 0);

  const handleBackupData = () => {
    addNotification({
      type: 'info',
      title: 'Backup Process Started',
      message: 'Attendance data backup has been initiated. You will be notified when complete.'
    });
    setShowAlert(false);
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
            Track and manage employee attendance and leave applications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab('leaves')}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Leave
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Monthly Backup Alert */}
      {showAlert && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Monthly Backup Required</h3>
                  <p className="text-sm text-yellow-700">
                    It's time to backup attendance data for {getMonthName(currentMonth)} {currentYear} and clear the database.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlert(false)}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Remind Later
                </Button>
                <Button
                  size="sm"
                  onClick={handleBackupData}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Backup Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Pending Leaves"
          value={pendingLeaves.length}
          icon={<Clock className="h-6 w-6" />}
          color="orange"
          subtitle="Awaiting approval"
          onClick={() => setActiveTab('leaves')}
        />
        <StatCard
          title="Monthly Summary"
          value={`${totalPresent}P / ${totalAbsent}A`}
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
          subtitle={`${totalHalfDays} half days, ${totalLeaves} leaves`}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="attendance" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Attendance Sheet</span>
          </TabsTrigger>
          <TabsTrigger value="leaves" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Leave Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <AttendanceGrid />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <LeaveManagement />
        </TabsContent>
      </Tabs>

      {/* Quick Stats Summary */}
      {monthlySummaries.length > 0 && activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Quick Summary - {getMonthName(selectedMonth)} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalLeaves}</div>
                <div className="text-sm text-blue-700">Total Leaves</div>
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