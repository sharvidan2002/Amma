import React, { useState } from 'react';
import { Save, X, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
  DialogFooter,
} from '../ui/dialog';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useUIStore } from '../../store/uiStore';
import { AttendanceStatus } from '../../types/attendance';
import { ATTENDANCE_STATUSES } from '../../lib/constants';
import { getCurrentMonthYear } from '../../lib/dateUtils';

interface AttendanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
  date?: number;
  initialStatus?: AttendanceStatus;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  isOpen,
  onClose,
  employeeId,
  date,
  initialStatus
}) => {
  const { employees } = useEmployeeStore();
  const { markAttendance } = useAttendanceStore();
  const { addNotification, setButtonLoading, buttonLoading } = useUIStore();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId || '');
  const [selectedDate, setSelectedDate] = useState(date || new Date().getDate());
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(initialStatus || 'present');
  const [notes, setNotes] = useState('');

  const { month, year } = getCurrentMonthYear();
  const selectedEmployee = employees.find(emp => emp._id === selectedEmployeeId);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedEmployeeId) {
    addNotification({
      type: 'error',
      title: 'Validation Error',
      message: 'Please select an employee.'
    });
    return;
  }

  setButtonLoading('save-attendance');

  try {
    markAttendance(selectedEmployeeId, selectedDate, selectedStatus, notes || undefined);

    addNotification({
      type: 'success',
      title: 'Attendance Marked',
      message: `Attendance marked successfully for ${selectedEmployee?.fullName}.`
    });

    onClose();
    resetForm();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    addNotification({
      type: 'error',
      title: 'Save Error',
      message: `Failed to mark attendance. ${errorMessage}`
    });

    console.error('Failed to mark attendance:', err);
  } finally {
    setButtonLoading(null);
  }
};


  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedDate(new Date().getDate());
    setSelectedStatus('present');
    setNotes('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Generate date options for current month
  const daysInMonth = new Date(year, month, 0).getDate();
  const dateOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Mark Attendance</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div>
            <Label htmlFor="employee">Employee *</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
              disabled={!!employeeId} // Disable if employee is pre-selected
            >
              <SelectTrigger>
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
                          <span className="text-xs text-slate-custom-500">
                            {employee.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span>{employee.fullName} ({employee.employeeNumber})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Date *</Label>
            <Select
              value={selectedDate.toString()}
              onValueChange={(value) => setSelectedDate(parseInt(value))}
              disabled={!!date} // Disable if date is pre-selected
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {day} {/* You could format this better with month name */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Selection */}
          <div>
            <Label htmlFor="status">Attendance Status *</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ATTENDANCE_STATUSES.map(status => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setSelectedStatus(status.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedStatus === status.value
                      ? 'border-crimson-500 bg-crimson-50'
                      : 'border-pearl-300 hover:border-pearl-400'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`w-4 h-4 rounded ${status.color}`}></div>
                    <span className="text-xs font-medium">{status.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              maxLength={200}
            />
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="p-3 bg-pearl-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {selectedEmployee.image ? (
                  <img
                    src={selectedEmployee.image}
                    alt={selectedEmployee.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-pearl-200 flex items-center justify-center">
                    <span className="text-sm text-slate-custom-500">
                      {selectedEmployee.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-custom-800">{selectedEmployee.fullName}</p>
                  <p className="text-sm text-slate-custom-600">{selectedEmployee.designation}</p>
                  <p className="text-xs text-slate-custom-500">#{selectedEmployee.employeeNumber}</p>
                </div>
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={buttonLoading === 'save-attendance' || !selectedEmployeeId}
          >
            {buttonLoading === 'save-attendance' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Mark Attendance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceForm;