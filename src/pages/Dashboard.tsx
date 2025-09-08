import React from 'react';
import { Users, UserPlus, Calendar, FileText, TrendingUp, Award, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useEmployeeStore } from '../store/employeeStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { useUIStore } from '../store/uiStore';
import { formatName } from '../lib/utils';
import { getCurrentMonthYear, getMonthName } from '../lib/dateUtils';
import { DESIGNATIONS } from '../lib/constants';

const Dashboard: React.FC = () => {
  const { employees } = useEmployeeStore();
  const { getAllMonthlySummaries, shouldShowMonthlyAlert, getPendingLeaveApplications } = useAttendanceStore();
  const { openEmployeeFormDialog, setCurrentPage } = useUIStore();

  const { month, year } = getCurrentMonthYear();
  const monthlySummaries = getAllMonthlySummaries(month, year);
  const pendingLeaves = getPendingLeaveApplications();
  const showAlert = shouldShowMonthlyAlert();

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.serviceConfirmed).length;
  const retiringSoon = employees.filter(emp => emp.age >= 58).length;

  // Designation breakdown
  const designationStats = DESIGNATIONS.map(designation => ({
    name: designation,
    count: employees.filter(emp => emp.designation === designation).length
  })).filter(stat => stat.count > 0);

  // Attendance statistics for current month
  const currentMonthAttendance = monthlySummaries.reduce((acc, summary) => {
    acc.totalPresent += summary.totalPresent;
    acc.totalAbsent += summary.totalAbsent;
    acc.totalLeaves += summary.totalLeaves;
    return acc;
  }, { totalPresent: 0, totalAbsent: 0, totalLeaves: 0 });

  const attendanceRate = monthlySummaries.length > 0
    ? Math.round(monthlySummaries.reduce((acc, summary) => acc + summary.attendancePercentage, 0) / monthlySummaries.length)
    : 0;

  // Recent employees (last 5 added)
  const recentEmployees = employees
    .filter(emp => emp.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  const StatCard = ({
    title,
    value,
    icon,
    trend,
    color = "crimson",
    onClick
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; positive: boolean };
    color?: string;
    onClick?: () => void;
  }) => (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${onClick ? 'hover:scale-[1.02]' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-custom-600">{title}</p>
            <p className="text-2xl font-bold text-slate-custom-800">{value}</p>
            {trend && (
              <p className={`text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.positive ? '+' : ''}{trend.value}% from last month
              </p>
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
          <h1 className="text-3xl font-bold text-slate-custom-800">Dashboard</h1>
          <p className="text-slate-custom-600">Welcome to the Employee Management System</p>
        </div>
        <Button onClick={openEmployeeFormDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Monthly Alert */}
      {showAlert && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">Monthly Backup Reminder</h3>
                <p className="text-sm text-yellow-700">
                  It's time to backup attendance and leave data for {getMonthName(month)} {year}.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                Backup Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-6 w-6" />}
          onClick={() => setCurrentPage('employees')}
        />
        <StatCard
          title="Active Service"
          value={activeEmployees}
          icon={<Award className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
          onClick={() => setCurrentPage('attendance')}
        />
        <StatCard
          title="Retiring Soon"
          value={retiringSoon}
          icon={<Clock className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Designation Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Staff by Designation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {designationStats.map((stat, index) => (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: `hsl(${(index * 45) % 360}, 70%, 50%)`
                      }}
                    />
                    <span className="text-sm text-slate-custom-700">{stat.name}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-custom-800">
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Additions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmployees.length > 0 ? (
              <div className="space-y-3">
                {recentEmployees.map((employee) => (
                  <div key={employee._id} className="flex items-center space-x-3">
                    {employee.image ? (
                      <img
                        src={employee.image}
                        alt={employee.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-pearl-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-pearl-200 flex items-center justify-center">
                        <span className="text-xs text-slate-custom-500">
                          {employee.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-custom-800 truncate">
                        {formatName(employee.fullName)}
                      </p>
                      <p className="text-xs text-slate-custom-500">
                        {employee.designation}
                      </p>
                    </div>
                    <div className="text-xs text-slate-custom-400">
                      {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-slate-custom-300 mb-2" />
                <p className="text-sm text-slate-custom-500">No employees added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>
              Attendance Overview - {getMonthName(month)} {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlySummaries.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {currentMonthAttendance.totalPresent}
                    </div>
                    <div className="text-xs text-slate-custom-500">Present</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">
                      {currentMonthAttendance.totalAbsent}
                    </div>
                    <div className="text-xs text-slate-custom-500">Absent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {currentMonthAttendance.totalLeaves}
                    </div>
                    <div className="text-xs text-slate-custom-500">Leaves</div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Attendance</span>
                    <span>{attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-pearl-200 rounded-full h-2">
                    <div
                      className="bg-crimson-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${attendanceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-slate-custom-300 mb-2" />
                <p className="text-sm text-slate-custom-500">No attendance data for this month</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              {pendingLeaves.slice(0, 5).map((leave) => {
                const employee = employees.find(emp => emp._id === leave.employeeId);
                return (
                  <div key={leave._id} className="flex items-center justify-between p-3 bg-pearl-50 rounded-lg">
                    <div className="flex items-center space-x-3">
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
                          {employee ? formatName(employee.fullName) : 'Unknown Employee'}
                        </p>
                        <p className="text-xs text-slate-custom-500">
                          {leave.leaveType} • {leave.startDate} to {leave.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                      </span>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
              {pendingLeaves.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View All ({pendingLeaves.length - 5} more)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={openEmployeeFormDialog}
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Add Employee</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setCurrentPage('attendance')}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Mark Attendance</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setCurrentPage('employees')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">View Employees</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setCurrentPage('reports')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Generate Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;