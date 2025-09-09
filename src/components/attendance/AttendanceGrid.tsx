import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Filter,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useEmployeeStore } from "../../store/employeeStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { useUIStore } from "../../store/uiStore";
import { AttendanceStatus } from "../../types/attendance";
import { ATTENDANCE_STATUSES } from "../../lib/constants";
import { getDaysInMonth, getMonthName } from "../../lib/dateUtils";
import { cn, formatName } from "../../lib/utils";

const AttendanceGrid: React.FC = () => {
  const { employees } = useEmployeeStore();
  const {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    getAttendanceForEmployee,
    markAttendance,
  } = useAttendanceStore();
  const { addNotification } = useUIStore();

  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string;
    date: number;
    currentStatus: AttendanceStatus | null;
  } | null>(null);
  const [filterText, setFilterText] = useState("");

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const isCurrentMonth =
    selectedMonth === currentDate.getMonth() + 1 &&
    selectedYear === currentDate.getFullYear();

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!filterText.trim()) return employees;
    const searchTerm = filterText.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.employeeNumber.toLowerCase().includes(searchTerm) ||
        emp.designation.toLowerCase().includes(searchTerm)
    );
  }, [employees, filterText]);

  // Generate date columns
  const dateColumns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
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

  const getAttendanceStatus = (
    employeeId: string,
    date: number
  ): AttendanceStatus | null => {
    const record = getAttendanceForEmployee(
      employeeId,
      selectedMonth,
      selectedYear
    );
    const dayRecord = record?.records.find((r) => r.date === date);
    return dayRecord?.status || null;
  };

  const getStatusColor = (status: AttendanceStatus | null): string => {
    if (!status) return "hover:bg-pearl-100";

    const statusConfig = ATTENDANCE_STATUSES.find((s) => s.value === status);
    return (
      statusConfig?.color.replace("bg-", "bg-") + " text-white" ||
      "bg-gray-500 text-white"
    );
  };

  const handleCellClick = (employeeId: string, date: number) => {
    const currentStatus = getAttendanceStatus(employeeId, date);
    setSelectedCell({ employeeId, date, currentStatus });
  };

  const handleStatusSelect = async (status: AttendanceStatus) => {
    if (!selectedCell) return;

    try {
      await markAttendance(selectedCell.employeeId, selectedCell.date, status);
      const employee = employees.find(
        (emp) => emp._id === selectedCell.employeeId
      );

      addNotification({
        type: "success",
        title: "Attendance Marked",
        message: `${status} marked for ${employee?.fullName} on ${selectedCell.date}/${selectedMonth}/${selectedYear}`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to mark attendance. Please try again.",
        duration: 3000,
      });
    }

    setSelectedCell(null);
  };

  const getEmployeeStats = (employeeId: string) => {
    const record = getAttendanceForEmployee(
      employeeId,
      selectedMonth,
      selectedYear
    );
    if (!record) return { present: 0, absent: 0, leave: 0, total: 0 };

    const stats = record.records.reduce(
      (acc, r) => {
        if (r.status === "present") acc.present++;
        else if (r.status === "absent") acc.absent++;
        else if (r.status.includes("leave")) acc.leave++;
        acc.total++;
        return acc;
      },
      { present: 0, absent: 0, leave: 0, total: 0 }
    );

    return stats;
  };

  const exportAttendance = () => {
    // This would trigger export functionality
    addNotification({
      type: "info",
      title: "Export Started",
      message: `Exporting attendance data for ${getMonthName(
        selectedMonth
      )} ${selectedYear}`,
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Month/Year Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("prev")}
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
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
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
                  {Array.from(
                    { length: 10 },
                    (_, i) => currentDate.getFullYear() - 5 + i
                  ).map((year) => (
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
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Employee Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-custom-500" />
            <Input
              placeholder="Search employees..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-custom-600">
            {filteredEmployees.length} employees
          </span>
          <Button variant="outline" onClick={exportAttendance}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Month Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-custom-800">
          {getMonthName(selectedMonth)} {selectedYear} - Attendance Sheet
        </h2>
        <p className="text-slate-custom-600">
          Click on any cell to mark attendance
        </p>
      </div>

      {/* Attendance Grid */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Attendance Grid</span>
            </span>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-xs">
              {ATTENDANCE_STATUSES.slice(0, 5).map((status) => (
                <div key={status.value} className="flex items-center space-x-1">
                  <div className={cn("w-3 h-3 rounded", status.color)}></div>
                  <span className="text-slate-custom-600">{status.label}</span>
                </div>
              ))}
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-pearl-200 border border-pearl-300"></div>
                <span className="text-slate-custom-600">Not Marked</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-[250px_50px_repeat(31,40px)] gap-1 mb-2 sticky top-0 bg-white z-10">
                <div className="font-semibold text-sm text-slate-custom-700 p-2 border-b border-pearl-300">
                  Employee
                </div>
                <div className="font-semibold text-xs text-slate-custom-700 p-2 border-b border-pearl-300 text-center">
                  Stats
                </div>
                {dateColumns.map((date) => {
                  const isToday =
                    isCurrentMonth && date === currentDate.getDate();
                  return (
                    <div
                      key={date}
                      className={cn(
                        "font-semibold text-xs text-slate-custom-700 p-2 border-b border-pearl-300 text-center",
                        isToday && "bg-crimson-50 text-crimson-700"
                      )}
                    >
                      {date}
                    </div>
                  );
                })}
              </div>

              {/* Table Body */}
              <div className="space-y-1">
                {filteredEmployees.map((employee) => {
                  const stats = getEmployeeStats(employee._id!);
                  return (
                    <div
                      key={employee._id}
                      className="grid grid-cols-[250px_50px_repeat(31,40px)] gap-1 hover:bg-pearl-50 transition-colors"
                    >
                      {/* Employee Info */}
                      <div className="flex items-center space-x-3 p-2 border-r border-pearl-200">
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
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-custom-800 truncate">
                            {formatName(employee.fullName)}
                          </p>
                          <p className="text-xs text-slate-custom-500 truncate">
                            {employee.employeeNumber} • {employee.designation}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-center p-1 border-r border-pearl-200">
                        <div className="text-xs text-center">
                          <div className="text-green-600 font-semibold">
                            {stats.present}
                          </div>
                          <div className="text-red-600">{stats.absent}</div>
                          <div className="text-blue-600">{stats.leave}</div>
                        </div>
                      </div>

                      {/* Attendance Cells */}
                      {dateColumns.map((date) => {
                        const status = getAttendanceStatus(employee._id!, date);
                        const isToday =
                          isCurrentMonth && date === currentDate.getDate();
                        const isFutureDate =
                          isCurrentMonth && date > currentDate.getDate();

                        return (
                          <button
                            key={date}
                            onClick={() =>
                              !isFutureDate &&
                              handleCellClick(employee._id!, date)
                            }
                            disabled={isFutureDate}
                            className={cn(
                              "w-10 h-10 text-xs font-medium rounded-sm transition-all duration-200 border border-pearl-200",
                              status
                                ? getStatusColor(status)
                                : "bg-white hover:bg-pearl-100",
                              isToday &&
                                !status &&
                                "ring-2 ring-crimson-500 ring-offset-1",
                              isFutureDate && "opacity-50 cursor-not-allowed",
                              !isFutureDate && "cursor-pointer hover:scale-105"
                            )}
                            title={
                              isFutureDate
                                ? "Future date"
                                : status
                                ? `${date}: ${status}`
                                : `${date}: Click to mark`
                            }
                          >
                            {status
                              ? status === "present"
                                ? "P"
                                : status === "absent"
                                ? "A"
                                : status === "half-day"
                                ? "H"
                                : "L"
                              : date}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-slate-custom-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-custom-800 mb-2">
                No employees found
              </h3>
              <p className="text-slate-custom-600">
                {employees.length === 0
                  ? "No employees in the system yet."
                  : "Try adjusting your search criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Selection Dialog */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Mark Attendance -{" "}
              {selectedCell?.date && getMonthName(selectedMonth)}{" "}
              {selectedCell?.date}, {selectedYear}
            </DialogTitle>
          </DialogHeader>

          {selectedCell && (
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="p-3 bg-pearl-50 rounded-lg">
                {(() => {
                  const employee = employees.find(
                    (emp) => emp._id === selectedCell.employeeId
                  );
                  return employee ? (
                    <div className="flex items-center space-x-3">
                      {employee.image ? (
                        <img
                          src={employee.image}
                          alt={employee.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-pearl-200 flex items-center justify-center">
                          <span className="text-sm text-slate-custom-500">
                            {employee.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-custom-800">
                          {formatName(employee.fullName)}
                        </p>
                        <p className="text-sm text-slate-custom-600">
                          {employee.designation}
                        </p>
                        <p className="text-xs text-slate-custom-500">
                          #{employee.employeeNumber}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Current Status */}
              {selectedCell.currentStatus && (
                <div className="text-sm text-slate-custom-600">
                  Current status:{" "}
                  <span className="font-medium text-slate-custom-800">
                    {
                      ATTENDANCE_STATUSES.find(
                        (s) => s.value === selectedCell.currentStatus
                      )?.label
                    }
                  </span>
                </div>
              )}

              {/* Status Options */}
              <div className="grid grid-cols-2 gap-3">
                {ATTENDANCE_STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    variant="outline"
                    onClick={() => handleStatusSelect(status.value)}
                    className={cn(
                      "h-12 flex flex-col items-center justify-center space-y-1",
                      "hover:border-current transition-all duration-200"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded", status.color)}></div>
                    <span className="text-xs">{status.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceGrid;
