import React, { useState } from "react";
import { Plus, Check, X, Clock, User, Calendar, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEmployeeStore } from "../../store/employeeStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { useUIStore } from "../../store/uiStore";
import { LeaveApplication, LeaveType } from "../../types/attendance";
import { LEAVE_TYPES } from "../../lib/constants";
import { formatName } from "../../lib/utils";
import {
  getDateRangeInDays,
  validateDateFormat,
  isValidDateRange,
} from "../../lib/dateUtils";
import DateInput from "../common/DateInput";

const LeaveManagement: React.FC = () => {
  const { employees } = useEmployeeStore();
  const {
    getPendingLeaveApplications,
    addLeaveApplication,
    approveLeave,
    rejectLeave,
  } = useAttendanceStore();

  const {
    addNotification,
    setButtonLoading,
    buttonLoading,
    openConfirmDialog,
  } = useUIStore();

  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  // Form state
  type FormData = {
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    reason: string;
  };

  const [formData, setFormData] = useState<FormData>({
    employeeId: "",
    leaveType: "casual-leave",
    startDate: "",
    endDate: "",
    isHalfDay: false,
    reason: "",
  });

  // Generic, fully-typed field updater
  const handleFieldChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotalDays = (): number => {
    if (!formData.startDate || !formData.endDate) return 0;

    if (!isValidDateRange(formData.startDate, formData.endDate)) return 0;

    const days = getDateRangeInDays(formData.startDate, formData.endDate);
    return formData.isHalfDay ? days * 0.5 : days;
  };

  const validateForm = (): boolean => {
    if (!formData.employeeId) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please select an employee.",
      });
      return false;
    }

    if (!formData.startDate || !validateDateFormat(formData.startDate)) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a valid start date.",
      });
      return false;
    }

    if (!formData.endDate || !validateDateFormat(formData.endDate)) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a valid end date.",
      });
      return false;
    }

    if (!isValidDateRange(formData.startDate, formData.endDate)) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "End date must be after start date.",
      });
      return false;
    }

    if (!formData.reason.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please provide a reason for leave.",
      });
      return false;
    }

    return true;
  };

  const handleSubmitApplication = async () => {
    if (!validateForm()) return;

    setButtonLoading("submit-leave");

    try {
      const employee = employees.find((emp) => emp._id === formData.employeeId);
      if (!employee) throw new Error("Employee not found");

      const totalDays = calculateTotalDays();

      const application: LeaveApplication = {
        employeeId: formData.employeeId,
        employeeNumber: employee.employeeNumber,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays,
        isHalfDay: formData.isHalfDay,
        reason: formData.reason,
        status: "pending",
        appliedDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addLeaveApplication(application);

      addNotification({
        type: "success",
        title: "Leave Application Submitted",
        message: `Leave application for ${employee.fullName} has been submitted successfully.`,
      });

      setIsApplicationDialogOpen(false);
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      addNotification({
        type: "error",
        title: "Submission Error",
        message: `Failed to submit leave application. ${errorMessage}`,
      });

      console.error("Failed to submit leave application:", err);
    } finally {
      setButtonLoading(null);
    }
  };

  const handleApproveLeave = (application: LeaveApplication) => {
    openConfirmDialog({
      title: "Approve Leave Application",
      message: `Are you sure you want to approve this leave application for ${getEmployeeName(
        application.employeeId
      )}?`,
      onConfirm: () => {
        approveLeave(application._id!, "Administrator");
        addNotification({
          type: "success",
          title: "Leave Approved",
          message: `Leave application has been approved successfully.`,
        });
      },
    });
  };

  const handleRejectLeave = (application: LeaveApplication) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      rejectLeave(application._id!, reason);
      addNotification({
        type: "info",
        title: "Leave Rejected",
        message: `Leave application has been rejected.`,
      });
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee ? employee.fullName : "Unknown Employee";
  };

  const getEmployeeData = (employeeId: string) => {
    return employees.find((emp) => emp._id === employeeId);
  };
  const pendingApplications: LeaveApplication[] = getPendingLeaveApplications();

  const resetForm = () => {
    setFormData({
      employeeId: "",
      leaveType: "casual-leave",
      startDate: "",
      endDate: "",
      isHalfDay: false,
      reason: "",
    });
  };

  const totalDays = calculateTotalDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-custom-800">
            Leave Management
          </h2>
          <p className="text-slate-custom-600">
            Manage employee leave applications and approvals
          </p>
        </div>
        <Button onClick={() => setIsApplicationDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Leave Application
        </Button>
      </div>

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Leave Applications</span>
            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {pendingApplications.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApplications.length > 0 ? (
            <div className="space-y-4">
              {pendingApplications.map((application) => {
                const employee = getEmployeeData(application.employeeId);
                return (
                  <div
                    key={application._id}
                    className="border border-pearl-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {employee?.image ? (
                          <img
                            src={employee.image}
                            alt={employee.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-pearl-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-slate-custom-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-custom-800">
                            {employee
                              ? formatName(employee.fullName)
                              : "Unknown Employee"}
                          </h3>
                          <p className="text-sm text-slate-custom-600">
                            {employee?.designation} • #
                            {application.employeeNumber}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-4 text-sm text-slate-custom-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {application.startDate} to{" "}
                                  {application.endDate}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {application.totalDays} day
                                  {application.totalDays !== 1 ? "s" : ""}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <FileText className="h-3 w-3 text-slate-custom-400" />
                              <span className="text-slate-custom-600">
                                <strong>Type:</strong>{" "}
                                {
                                  LEAVE_TYPES.find(
                                    (t) => t.value === application.leaveType
                                  )?.label
                                }
                              </span>
                            </div>
                            <div className="text-sm text-slate-custom-600">
                              <strong>Reason:</strong> {application.reason}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectLeave(application)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveLeave(application)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto text-slate-custom-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-custom-800 mb-2">
                No Pending Applications
              </h3>
              <p className="text-slate-custom-600">
                All leave applications have been processed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Application Dialog */}
      <Dialog
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Leave Application</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Selection */}
            <div>
              <Label htmlFor="employee">Employee *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) =>
                  handleFieldChange("employeeId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
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
                            <span className="text-xs text-slate-custom-500">
                              {employee.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span>
                          {employee.fullName} ({employee.employeeNumber})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Leave Type */}
              <div>
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value: LeaveType) =>
                    handleFieldChange("leaveType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Half Day Checkbox */}
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={formData.isHalfDay}
                  onChange={(e) =>
                    handleFieldChange("isHalfDay", e.target.checked)
                  }
                  className="rounded border-pearl-300"
                />
                <Label htmlFor="halfDay">Half Day Leave</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <DateInput
                label="Start Date *"
                value={formData.startDate}
                onChange={(value) => handleFieldChange("startDate", value)}
                required
              />

              {/* End Date */}
              <DateInput
                label="End Date *"
                value={formData.endDate}
                onChange={(value) => handleFieldChange("endDate", value)}
                required
              />
            </div>

            {/* Total Days Display */}
            {totalDays > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Total Leave Days: {totalDays} day{totalDays !== 1 ? "s" : ""}
                  {formData.isHalfDay && " (Half day calculation applied)"}
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason for Leave *</Label>
              <textarea
                id="reason"
                className="modern-input w-full min-h-[80px] resize-vertical"
                value={formData.reason}
                onChange={(e) => handleFieldChange("reason", e.target.value)}
                placeholder="Please provide the reason for your leave application..."
                maxLength={500}
              />
              <p className="text-xs text-slate-custom-500 mt-1">
                {formData.reason.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsApplicationDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={buttonLoading === "submit-leave"}
            >
              {buttonLoading === "submit-leave" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveManagement;
