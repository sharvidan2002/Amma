export interface Employee {
  _id?: string;

  // Basic Information
  employeeNumber: string; // Unique identifier
  image?: string | null; // Base64 encoded image
  fullName: string;
  designation: Designation;
  ministry: string;
  gender: 'Male' | 'Female';

  // Address
  personalAddress: {
    line1: string;
    line2: string;
    line3: string;
  };

  // Contact Information
  mobileNumber: string; // Format: 012 345 6789
  emailAddress: string;

  // Identification
  nicNumber: string; // Can be old or new format
  dateOfBirth: string; // dd-MM-yyyy format
  age: number; // Auto-calculated

  // Employment Dates
  firstAppointmentDate: string; // dd-MM-yyyy
  gradeAppointmentDate: {
    gradeIII?: string; // dd-MM-yyyy
    gradeII?: string; // dd-MM-yyyy
    gradeI?: string; // dd-MM-yyyy
    gradeSupra?: string; // dd-MM-yyyy
  };

  // Additional Employment Info
  appointmentLetterNo: string;
  incrementDate: string; // dd-MM format
  wopNumber: string; // W & OP Number (mixed format)
  educationalQualification: string;
  centralProvincial: 'Central' | 'Provincial';
  dateOfArrivalVDS: string; // dd-MM-yyyy
  status: string;
  dateOfTransfer?: string; // dd-MM-yyyy
  ebPass: boolean;
  serviceConfirmed: boolean;
  secondLanguagePassed: boolean;
  retiredDate: string; // Auto-calculated (age 60)
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  salaryCode: SalaryCode;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

export type Designation =
  | 'District Officer'
  | 'Asst.District Officer'
  | 'Management Service Officer'
  | 'Development Officer'
  | 'Extension officer'
  | 'Office employee service'
  | 'Garden labour';

export type SalaryCode = 'M1' | 'M2' | 'M3' | 'A1' | 'A2' | 'B3' | 'C3' | 'C4';

export interface EmployeeFilter {
  employeeNumber?: string;
  fullName?: string;
  designation?: Designation;
  ministry?: string;
  nicNumber?: string;
  gender?: 'Male' | 'Female';
  salaryCode?: SalaryCode;
  ageRange?: {
    min: number;
    max: number;
  };
}

export interface EmployeeFormData extends Omit<Employee, '_id' | 'age' | 'retiredDate' | 'createdAt' | 'updatedAt'> {
  imageFile?: File;
}