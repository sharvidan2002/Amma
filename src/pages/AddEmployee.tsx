import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Users, UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useEmployeeStore } from '../store/employeeStore';
import { useUIStore } from '../store/uiStore';
import { Employee, EmployeeFormData } from '../types/employee';
import {
  DESIGNATIONS,
  SALARY_CODES,
  GENDERS,
  MARITAL_STATUS,
  CENTRAL_PROVINCIAL,
  VALIDATION_RULES
} from '../lib/constants';
import { generateEmployeeNumber, isValidEmail, formatMobileNumber } from '../lib/utils';
import { calculateAge, calculateRetirementDate, formatDateForDisplay } from '../lib/dateUtils';
import DateInput from '../components/common/DateInput';
import NICInput from '../components/common/NICInput';
import ImageCropper from '../components/employee/ImageCropper';

const AddEmployee: React.FC = () => {
  const { addEmployee } = useEmployeeStore();
  const {
    addNotification,
    setButtonLoading,
    buttonLoading,
    setCurrentPage
  } = useUIStore();

  // Initialize form data
  const initialFormData: EmployeeFormData = {
    employeeNumber: generateEmployeeNumber(),
    fullName: '',
    designation: 'District Officer',
    ministry: '',
    gender: 'Male',
    personalAddress: {
      line1: '',
      line2: '',
      line3: ''
    },
    mobileNumber: '',
    emailAddress: '',
    nicNumber: '',
    dateOfBirth: '',
    firstAppointmentDate: '',
    gradeAppointmentDate: {},
    appointmentLetterNo: '',
    incrementDate: '',
    wopNumber: '',
    educationalQualification: '',
    centralProvincial: 'Central',
    dateOfArrivalVDS: '',
    status: 'Active',
    dateOfTransfer: '',
    ebPass: false,
    serviceConfirmed: false,
    secondLanguagePassed: false,
    maritalStatus: 'Single',
    salaryCode: 'M1'
  };

  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilledFromNIC, setAutoFilledFromNIC] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };

      if (keys.length === 1) {
        (newData as any)[field] = value;
      } else {
        (newData as any)[keys[0]] = {
          ...(newData as any)[keys[0]],
          [keys[1]]: value
        };
      }

      return newData;
    });

    setIsDirty(true);

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle NIC validation and auto-fill
  const handleNICValidation = (isValid: boolean, extractedData?: any) => {
    if (isValid && extractedData && !autoFilledFromNIC) {
      if (extractedData.birthDate) {
        handleFieldChange('dateOfBirth', extractedData.birthDate);
      }
      if (extractedData.gender) {
        handleFieldChange('gender', extractedData.gender);
      }
      setAutoFilledFromNIC(true);

      addNotification({
        type: 'info',
        title: 'Auto-filled from NIC',
        message: 'Date of birth and gender have been automatically filled from NIC.',
        duration: 3000
      });
    }
  };

  // Calculate age and retirement date when DOB changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth.split('-').reverse().join('-'));
      if (!isNaN(birthDate.getTime())) {
        const age = calculateAge(birthDate);
        const retirementDate = calculateRetirementDate(birthDate);

        setFormData(prev => ({
          ...prev,
          age,
          retiredDate: formatDateForDisplay(retirementDate)
        }));
      }
    }
  }, [formData.dateOfBirth]);

  // Format mobile number
  const handleMobileNumberChange = (value: string) => {
    const formatted = formatMobileNumber(value);
    handleFieldChange('mobileNumber', formatted);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = VALIDATION_RULES.fullName.message;
    }

    if (!formData.employeeNumber.trim()) {
      newErrors.employeeNumber = 'Employee number is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = VALIDATION_RULES.mobileNumber.message;
    } else if (!VALIDATION_RULES.mobileNumber.pattern.test(formData.mobileNumber)) {
      newErrors.mobileNumber = VALIDATION_RULES.mobileNumber.message;
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = VALIDATION_RULES.emailAddress.message;
    } else if (!isValidEmail(formData.emailAddress)) {
      newErrors.emailAddress = VALIDATION_RULES.emailAddress.message;
    }

    if (!formData.nicNumber.trim()) {
      newErrors.nicNumber = VALIDATION_RULES.nicNumber.message;
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.firstAppointmentDate.trim()) {
      newErrors.firstAppointmentDate = 'First appointment date is required';
    }

    if (!formData.ministry.trim()) {
      newErrors.ministry = 'Ministry is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.'
      });
      return;
    }

    setButtonLoading('save-employee');

    try {
      // Prepare employee data
      const employeeData: Employee = {
        ...formData,
        age: formData.age || 0,
        retiredDate: formData.retiredDate || '',
        image: formData.image,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addEmployee(employeeData);

      addNotification({
        type: 'success',
        title: 'Employee Added Successfully',
        message: `${employeeData.fullName} has been added to the system.`
      });

      // Reset form
      setFormData({ ...initialFormData, employeeNumber: generateEmployeeNumber() });
      setErrors({});
      setIsDirty(false);
      setAutoFilledFromNIC(false);

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save employee data. Please try again.'
      });
    } finally {
      setButtonLoading(null);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({ ...initialFormData, employeeNumber: generateEmployeeNumber() });
    setErrors({});
    setIsDirty(false);
    setAutoFilledFromNIC(false);
  };

  const FormSection = ({
    title,
    icon,
    children
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-base">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage('employees')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-custom-800">Add New Employee</h1>
            <p className="text-slate-custom-600">Enter employee information and details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <FormSection title="Basic Information" icon={<UserPlus className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeNumber">Employee Number *</Label>
                <Input
                  id="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={(e) => handleFieldChange('employeeNumber', e.target.value.toUpperCase())}
                  placeholder="EMP001"
                />
                {errors.employeeNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.employeeNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Select
                  value={formData.designation}
                  onValueChange={(value) => handleFieldChange('designation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map(designation => (
                      <SelectItem key={designation} value={designation}>
                        {designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ministry">Ministry *</Label>
                <Input
                  id="ministry"
                  value={formData.ministry}
                  onChange={(e) => handleFieldChange('ministry', e.target.value)}
                  placeholder="Ministry of..."
                />
                {errors.ministry && (
                  <p className="text-sm text-red-600 mt-1">{errors.ministry}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleFieldChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map(gender => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => handleFieldChange('maritalStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Employee Photo */}
            <ImageCropper
              value={formData.image}
              onChange={(image) => handleFieldChange('image', image)}
              label="Employee Photo"
            />
          </FormSection>

          {/* Contact Information */}
          <FormSection title="Contact Information" icon={<Users className="h-4 w-4" />}>
            <div className="space-y-4">
              <div>
                <Label>Personal Address</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Address Line 1"
                    value={formData.personalAddress.line1}
                    onChange={(e) => handleFieldChange('personalAddress.line1', e.target.value)}
                  />
                  <Input
                    placeholder="Address Line 2"
                    value={formData.personalAddress.line2}
                    onChange={(e) => handleFieldChange('personalAddress.line2', e.target.value)}
                  />
                  <Input
                    placeholder="Address Line 3"
                    value={formData.personalAddress.line3}
                    onChange={(e) => handleFieldChange('personalAddress.line3', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mobileNumber">Mobile Number * (+94)</Label>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleMobileNumberChange(e.target.value)}
                  placeholder="012 345 6789"
                  maxLength={12}
                />
                {errors.mobileNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.mobileNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emailAddress">Email Address *</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleFieldChange('emailAddress', e.target.value)}
                  placeholder="john.doe@example.com"
                />
                {errors.emailAddress && (
                  <p className="text-sm text-red-600 mt-1">{errors.emailAddress}</p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Personal Details */}
          <FormSection title="Personal Details" icon={<Users className="h-4 w-4" />}>
            <div className="space-y-4">
              <NICInput
                label="NIC Number *"
                value={formData.nicNumber}
                onChange={(value) => handleFieldChange('nicNumber', value)}
                onValidationChange={handleNICValidation}
                required
                error={errors.nicNumber}
              />

              <DateInput
                label="Date of Birth *"
                value={formData.dateOfBirth}
                onChange={(value) => handleFieldChange('dateOfBirth', value)}
                required
                error={errors.dateOfBirth}
              />

              {formData.age > 0 && (
                <div>
                  <Label>Age</Label>
                  <Input
                    value={`${formData.age} years`}
                    disabled
                    className="bg-pearl-50"
                  />
                </div>
              )}

              {formData.retiredDate && (
                <div>
                  <Label>Retirement Date</Label>
                  <Input
                    value={formData.retiredDate}
                    disabled
                    className="bg-pearl-50"
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Employment Information */}
          <FormSection title="Employment Information" icon={<Users className="h-4 w-4" />}>
            <div className="space-y-4">
              <DateInput
                label="First Appointment Date *"
                value={formData.firstAppointmentDate}
                onChange={(value) => handleFieldChange('firstAppointmentDate', value)}
                required
                error={errors.firstAppointmentDate}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryCode">Salary Code *</Label>
                  <Select
                    value={formData.salaryCode}
                    onValueChange={(value) => handleFieldChange('salaryCode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary code" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALARY_CODES.map(code => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="centralProvincial">Central/Provincial</Label>
                  <Select
                    value={formData.centralProvincial}
                    onValueChange={(value) => handleFieldChange('centralProvincial', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CENTRAL_PROVINCIAL.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentLetterNo">Appointment Letter No</Label>
                  <Input
                    id="appointmentLetterNo"
                    value={formData.appointmentLetterNo}
                    onChange={(e) => handleFieldChange('appointmentLetterNo', e.target.value)}
                    placeholder="AL/2024/001"
                  />
                </div>

                <div>
                  <Label htmlFor="wopNumber">W & OP Number</Label>
                  <Input
                    id="wopNumber"
                    value={formData.wopNumber}
                    onChange={(e) => handleFieldChange('wopNumber', e.target.value)}
                    placeholder="Mixed format accepted"
                  />
                </div>
              </div>

              <DateInput
                label="Increment Date"
                value={formData.incrementDate}
                onChange={(value) => handleFieldChange('incrementDate', value)}
                format="month-day"
                placeholder="dd-MM"
              />

              {/* Boolean Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ebPass"
                    checked={formData.ebPass}
                    onChange={(e) => handleFieldChange('ebPass', e.target.checked)}
                    className="rounded border-pearl-300"
                  />
                  <Label htmlFor="ebPass">EB Pass</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="serviceConfirmed"
                    checked={formData.serviceConfirmed}
                    onChange={(e) => handleFieldChange('serviceConfirmed', e.target.checked)}
                    className="rounded border-pearl-300"
                  />
                  <Label htmlFor="serviceConfirmed">Service Confirmed</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="secondLanguagePassed"
                    checked={formData.secondLanguagePassed}
                    onChange={(e) => handleFieldChange('secondLanguagePassed', e.target.checked)}
                    className="rounded border-pearl-300"
                  />
                  <Label htmlFor="secondLanguagePassed">2nd Language Passed</Label>
                </div>
              </div>
            </div>
          </FormSection>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="educationalQualification">Educational Qualification</Label>
              <textarea
                id="educationalQualification"
                className="modern-input w-full min-h-[80px] resize-vertical"
                value={formData.educationalQualification}
                onChange={(e) => handleFieldChange('educationalQualification', e.target.value)}
                placeholder="Enter educational qualifications..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DateInput
                label="Date of Arrival VDS"
                value={formData.dateOfArrivalVDS}
                onChange={(value) => handleFieldChange('dateOfArrivalVDS', value)}
              />

              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  placeholder="Active, Inactive, etc."
                />
              </div>

              <DateInput
                label="Date of Transfer"
                value={formData.dateOfTransfer || ''}
                onChange={(value) => handleFieldChange('dateOfTransfer', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-pearl-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentPage('employees')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={buttonLoading === 'save-employee'}
            className="min-w-[140px]"
          >
            {buttonLoading === 'save-employee' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Employee
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;