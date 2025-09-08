import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { AttendanceStatus } from '../../types/attendance';
import { ATTENDANCE_STATUSES } from '../../lib/constants';
import { getDaysInMonth, getMonthName } from '../../lib/dateUtils';
import { cn } from '../../lib/utils';

const AttendanceCalendar: React.FC = () => {
  const { employees } = useEmployeeStore();
  const {
    selectedMonth,
    selectedYear,
    selectedEmployeeId,
    setSelectedMonth,
    setSelectedYear,
    setSelectedEmployeeId,
    getAttendanceForEmployee,
    markAttendance
  } = useAttendanceStore();

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isMarkingDialogOpen, setIsMarkingDialogOpen] = useState(false);

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  const selectedEmployee = employees.find(emp => emp._id === selectedEmployeeId);
  const attendanceRecord = selectedEmployeeId
    ? getAttendanceForEmployee(selectedEmployeeId, selectedMonth, selectedYear)
    : null;

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getAttendanceStatus = (day: number): AttendanceStatus | null => {
    if (!attendanceRecord) return null;
    const dayRecord = attendanceRecord.records.find(r => r.date === day);
    return dayRecord?.status || null;
  };

  const getAttendanceColor = (status: AttendanceStatus | null): string => {
  if (!status) return 'attendance-cell empty';

  const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status);
  return `attendance-cell ${statusConfig?.color ?? status}`;
};


  const handleDateClick = (day: number | null) => {
    if (!day || !selectedEmployeeId) return;

    setSelectedDate(day);
    setIsMarkingDialogOpen(true);
  };

  const handleMarkAttendance = (status: AttendanceStatus, notes?: string) => {
    if (!selectedDate || !selectedEmployeeId) return;

    markAttendance(selectedEmployeeId, selectedDate, status, notes);
    setIsMarkingDialogOpen(false);
    setSelectedDate(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const getAttendanceSummary = () => {
    if (!attendanceRecord) return null;

    const summary = {
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      total: attendanceRecord.records.length
    };

    attendanceRecord.records.forEach(record => {
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'half-day':
          summary.halfDay++;
          break;
        default:
          if (record.status.includes('leave')) {
            summary.leave++;
          }
          break;
      }
    });

    return summary;
  };

  const summary = getAttendanceSummary();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Employee Selection */}
          <Select
            value={selectedEmployeeId || ''}
            onValueChange={setSelectedEmployeeId}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(employee => (
                <SelectItem key={employee._id} value={employee._id!}>
                  <div className="flex items-center space-x-2">
                    {employee.image ? (
                      <img
                        src={employee.image}
                        alt={employee.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-pearl-200 flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                    <span>{employee.fullName} ({employee.employeeNumber})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month/Year Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2 min-w-[200px] justify-center">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Month Display */}
        <div className="text-xl font-semibold text-slate-custom-800">
          {getMonthName(selectedMonth)} {selectedYear}
        </div>
      </div>

      {/* Selected Employee Info */}
      {selectedEmployee && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedEmployee.image ? (
                  <img
                    src={selectedEmployee.image}
                    alt={selectedEmployee.fullName}
                    className="w-12 h-12 rounded-lg object-cover border border-pearl-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-pearl-200 flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-slate-custom-800">{selectedEmployee.fullName}</h3>
                  <p className="text-sm text-slate-custom-600">{selectedEmployee.designation}</p>
                  <p className="text-xs text-slate-custom-500">Employee #{selectedEmployee.employeeNumber}</p>
                </div>
              </div>

              {summary && (
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">{summary.present}</div>
                    <div className="text-xs text-slate-custom-500">Present</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">{summary.absent}</div>
                    <div className="text-xs text-slate-custom-500">Absent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-600">{summary.halfDay}</div>
                    <div className="text-xs text-slate-custom-500">Half Day</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">{summary.leave}</div>
                    <div className="text-xs text-slate-custom-500">Leave</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Attendance Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedEmployeeId ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 mx-auto text-slate-custom-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-custom-800 mb-2">Select an Employee</h3>
              <p className="text-slate-custom-600">Choose an employee to view and manage their attendance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-custom-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-8"></div>;
                  }

                  const status = getAttendanceStatus(day);
                  const isToday = day === currentDate.getDate() &&
                                  selectedMonth === currentDate.getMonth() + 1 &&
                                  selectedYear === currentDate.getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        getAttendanceColor(status),
                        isToday && "ring-2 ring-crimson-500 ring-offset-1",
                        "relative"
                      )}
                      title={status ? `${day}: ${status}` : `${day}: Not marked`}
                    >
                      {day}
                      {isToday && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-crimson-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-pearl-200">
                {ATTENDANCE_STATUSES.map(status => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <div className={cn("w-4 h-4 rounded", status.color)}></div>
                    <span className="text-xs text-slate-custom-600">{status.label}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-pearl-100 border border-pearl-300"></div>
                  <span className="text-xs text-slate-custom-600">Not Marked</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark Attendance Dialog */}
      <Dialog open={isMarkingDialogOpen} onOpenChange={setIsMarkingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mark Attendance - {selectedDate && getMonthName(selectedMonth)} {selectedDate}, {selectedYear}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {ATTENDANCE_STATUSES.map(status => (
                <Button
                  key={status.value}
                  variant="outline"
                  onClick={() => handleMarkAttendance(status.value)}
                  className={cn(
                    "h-12 flex flex-col items-center justify-center space-y-1",
                    "hover:border-current"
                  )}
                  style={{
                    color: status.color.includes('bg-') ?
                      status.color.replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' :
                      status.color.replace('bg-', '').replace('-500', '') === 'red' ? '#ef4444' :
                      status.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#f59e0b' :
                      status.color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
                      status.color.replace('bg-', '').replace('-500', '') === 'purple' ? '#a855f7' :
                      status.color.replace('bg-', '').replace('-500', '') === 'indigo' ? '#6366f1' :
                      status.color.replace('bg-', '').replace('-500', '') === 'cyan' ? '#06b6d4' :
                      '#f97316' : '#64748b'
                  }}
                >
                  <div className={cn("w-4 h-4 rounded", status.color)}></div>
                  <span className="text-xs">{status.label}</span>
                </Button>
              ))}
            </div>

            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsMarkingDialogOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceCalendar;