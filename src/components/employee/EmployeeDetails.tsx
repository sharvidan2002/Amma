import React from 'react';
import { Edit, User, MapPin, Phone, Mail, IdCard, Calendar, Briefcase, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useEmployeeStore } from '../../store/employeeStore';
import { useUIStore } from '../../store/uiStore';
import { formatName } from '../../lib/utils';
import PrintButton from '../common/PrintButton';

const EmployeeDetails: React.FC = () => {
  const { selectedEmployee } = useEmployeeStore();
  const {
    employeeDetailsDialogOpen,
    closeEmployeeDetailsDialog,
    openEmployeeFormDialog
  } = useUIStore();

  if (!selectedEmployee) return null;

  const employee = selectedEmployee;

  const handleEdit = () => {
    closeEmployeeDetailsDialog();
    openEmployeeFormDialog();
  };

  const DetailSection = ({
    title,
    icon,
    children
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  );

  const DetailRow = ({
    label,
    value,
    className = ""
  }: {
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div className={`flex justify-between py-1 ${className}`}>
      <span className="text-sm font-medium text-slate-custom-600">{label}:</span>
      <span className="text-sm text-slate-custom-800 text-right max-w-xs">
        {value || 'Not specified'}
      </span>
    </div>
  );

  return (
    <Dialog open={employeeDetailsDialogOpen} onOpenChange={closeEmployeeDetailsDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            {employee.image ? (
              <img
                src={employee.image}
                alt={employee.fullName}
                className="w-16 h-16 rounded-lg object-cover border-2 border-pearl-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-pearl-200 flex items-center justify-center">
                <User className="h-8 w-8 text-slate-custom-400" />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl">{formatName(employee.fullName)}</DialogTitle>
              <p className="text-slate-custom-600">{employee.designation}</p>
              <p className="text-sm text-slate-custom-500">Employee #{employee.employeeNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <PrintButton
              type="individual"
              data={employee}
              className="h-9"
            />
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <DetailSection
            title="Basic Information"
            icon={<User className="h-4 w-4" />}
          >
            <DetailRow label="Full Name" value={formatName(employee.fullName)} />
            <DetailRow label="Employee Number" value={employee.employeeNumber} />
            <DetailRow label="Designation" value={employee.designation} />
            <DetailRow label="Ministry" value={employee.ministry} />
            <DetailRow
              label="Gender"
              value={
                <span className={`status-badge ${employee.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                  {employee.gender}
                </span>
              }
            />
            <DetailRow label="Marital Status" value={employee.maritalStatus} />
          </DetailSection>

          {/* Contact Information */}
          <DetailSection
            title="Contact Information"
            icon={<MapPin className="h-4 w-4" />}
          >
            <DetailRow
              label="Address"
              value={
                <div className="text-right">
                  <div>{employee.personalAddress.line1}</div>
                  {employee.personalAddress.line2 && <div>{employee.personalAddress.line2}</div>}
                  {employee.personalAddress.line3 && <div>{employee.personalAddress.line3}</div>}
                </div>
              }
            />
            <DetailRow
              label="Mobile Number"
              value={
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>+94 {employee.mobileNumber}</span>
                </div>
              }
            />
            <DetailRow
              label="Email Address"
              value={
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>{employee.emailAddress}</span>
                </div>
              }
            />
          </DetailSection>

          {/* Personal Details */}
          <DetailSection
            title="Personal Details"
            icon={<IdCard className="h-4 w-4" />}
          >
            <DetailRow label="NIC Number" value={employee.nicNumber} />
            <DetailRow label="Date of Birth" value={employee.dateOfBirth} />
            <DetailRow label="Age" value={`${employee.age} years`} />
            <DetailRow label="Retirement Date" value={employee.retiredDate} />
          </DetailSection>

          {/* Employment Information */}
          <DetailSection
            title="Employment Information"
            icon={<Briefcase className="h-4 w-4" />}
          >
            <DetailRow label="First Appointment" value={employee.firstAppointmentDate} />
            <DetailRow label="Salary Code" value={
              <span className="font-mono bg-pearl-100 px-2 py-1 rounded text-xs">
                {employee.salaryCode}
              </span>
            } />
            <DetailRow label="Central/Provincial" value={employee.centralProvincial} />
            <DetailRow label="Increment Date" value={employee.incrementDate} />
            <DetailRow label="W & OP Number" value={employee.wopNumber} />
            <DetailRow label="Appointment Letter No" value={employee.appointmentLetterNo} />
          </DetailSection>

          {/* Grade Appointments */}
          <DetailSection
            title="Grade Appointments"
            icon={<Calendar className="h-4 w-4" />}
          >
            <DetailRow label="Grade III" value={employee.gradeAppointmentDate.gradeIII} />
            <DetailRow label="Grade II" value={employee.gradeAppointmentDate.gradeII} />
            <DetailRow label="Grade I" value={employee.gradeAppointmentDate.gradeI} />
            <DetailRow label="Grade Supra" value={employee.gradeAppointmentDate.gradeSupra} />
          </DetailSection>

          {/* Additional Information */}
          <DetailSection
            title="Additional Information"
            icon={<FileText className="h-4 w-4" />}
          >
            <DetailRow
              label="Educational Qualification"
              value={
                <div className="text-right max-w-xs">
                  {employee.educationalQualification}
                </div>
              }
            />
            <DetailRow label="Date of Arrival VDS" value={employee.dateOfArrivalVDS} />
            <DetailRow label="Status" value={employee.status} />
            <DetailRow label="Date of Transfer" value={employee.dateOfTransfer} />
            <DetailRow
              label="EB Pass"
              value={
                <span className={`status-badge ${employee.ebPass ? 'active' : 'inactive'}`}>
                  {employee.ebPass ? 'Yes' : 'No'}
                </span>
              }
            />
            <DetailRow
              label="Service Confirmed"
              value={
                <span className={`status-badge ${employee.serviceConfirmed ? 'active' : 'inactive'}`}>
                  {employee.serviceConfirmed ? 'Yes' : 'No'}
                </span>
              }
            />
            <DetailRow
              label="2nd Language Passed"
              value={
                <span className={`status-badge ${employee.secondLanguagePassed ? 'active' : 'inactive'}`}>
                  {employee.secondLanguagePassed ? 'Yes' : 'No'}
                </span>
              }
            />
          </DetailSection>
        </div>

        {/* Footer with metadata */}
        {(employee.createdAt || employee.updatedAt) && (
          <div className="mt-6 pt-4 border-t border-pearl-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-custom-500">
              {employee.createdAt && (
                <div>
                  <span className="font-medium">Created:</span> {new Date(employee.createdAt).toLocaleString()}
                </div>
              )}
              {employee.updatedAt && (
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(employee.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetails;