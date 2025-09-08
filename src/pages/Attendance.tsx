import React from 'react';
import { Calendar, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
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
    // This would trigger the backup process
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
    subtitle
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }) => (
    <Card>
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
        />
        <StatCard
          title="Present Days"
          value={totalPresent}
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
          subtitle={`${totalAbsent} absent, ${totalLeaves} on leave`}
        />
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Summary - {getMonthName(selectedMonth)} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySummaries.length > 0 ? (
            <div className="space-y-4">
              {/* Overall Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-pearl-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalPresent}</div>
                  <div className="text-sm text-slate-custom-600">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{totalAbsent}</div>
                  <div className="text-sm text-slate-custom-600">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{totalHalfDays}</div>
                  <div className="text-sm text-slate-custom-600">Half Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalLeaves}</div>
                  <div className="text-sm text-slate-custom-600">Leaves</div>
                </div>
              </div>

              {/* Top Performers */}
              <div>
                <h3 className="font-medium text-slate-custom-800 mb-3">Top Attendance</h3>
                <div className="space-y-2">
                  {monthlySummaries
                    .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
                    .slice(0, 5)
                    .map((summary, index) => {
                      const employee = employees.find(emp => emp._id === summary.employeeId);
                      return (
                        <div key={summary.employeeId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-pearl-200">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                            {employee?.image ? (
                              <img
                                src={employee.image}
                                alt={employee.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-pearl-200 flex items-center justify-center">
                                <span className="text-xs text-slate-custom-500">
                                  {employee?.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-custom-800">
                                {employee?.fullName || 'Unknown Employee'}
                              </p>
                              <p className="text-xs text-slate-custom-500">
                                {employee?.designation}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">
                              {summary.attendancePercentage}%
                            </div>
                            <div className="text-xs text-slate-custom-500">
                              {summary.totalPresent}P {summary.totalAbsent}A {summary.totalLeaves}L
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 mx-auto text-slate-custom-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-custom-800 mb-2">No Attendance Data</h3>
              <p className="text-slate-custom-600">
                No attendance records found for {getMonthName(selectedMonth)} {selectedYear}.
                Start marking attendance to see summaries here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Leave Applications */}
      {pendingLeaves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Leave Applications</span>
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                {pendingLeaves.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLeaves.map((leave) => {
                const employee = employees.find(emp => emp._id === leave.employeeId);
                return (
                  <div key={leave._id} className="flex items-center justify-between p-4 bg-pearl-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {employee?.image ? (
                        <img
                          src={employee.image}
                          alt={employee.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-pearl-200 flex items-center justify-center">
                          <span className="text-sm text-slate-custom-500">
                            {employee?.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-custom-800">
                          {employee?.fullName || 'Unknown Employee'}
                        </p>
                        <p className="text-sm text-slate-custom-600">
                          {leave.leaveType} • {leave.startDate} to {leave.endDate}
                        </p>
                        <p className="text-xs text-slate-custom-500">
                          Reason: {leave.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Reject
                        </Button>
                        <Button size="sm">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Attendance Calendar */}
      <AttendanceCalendar />
    </div>
  );
};

export default Attendance;