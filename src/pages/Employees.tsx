import React from 'react';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import EmployeeList from '../components/employee/EmployeeList';
import EmployeeFilters from '../components/employee/EmployeeFilters';
import EmployeeDetails from '../components/employee/EmployeeDetails';
import EmployeeForm from '../components/employee/EmployeeForm';
import PrintButton from '../components/common/PrintButton';
import { useEmployeeStore } from '../store/employeeStore';
import { useUIStore } from '../store/uiStore';

const Employees: React.FC = () => {
  const { employees, getFilteredEmployees } = useEmployeeStore();
  const { openEmployeeFormDialog } = useUIStore();

  const filteredEmployees = getFilteredEmployees();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-custom-800">Employees</h1>
          <p className="text-slate-custom-600">
            Manage and view employee information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {filteredEmployees.length > 0 && (
            <PrintButton
              type="bulk"
              data={filteredEmployees}
              className="bg-slate-custom-600 hover:bg-slate-custom-700"
            />
          )}
          <Button onClick={openEmployeeFormDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Employee Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-crimson-600">{employees.length}</div>
              <div className="text-sm text-slate-custom-600">Total Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {employees.filter(emp => emp.serviceConfirmed).length}
              </div>
              <div className="text-sm text-slate-custom-600">Service Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {employees.filter(emp => emp.gender === 'Male').length}
              </div>
              <div className="text-sm text-slate-custom-600">Male</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {employees.filter(emp => emp.gender === 'Female').length}
              </div>
              <div className="text-sm text-slate-custom-600">Female</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <EmployeeFilters />

      {/* Employee List */}
      <EmployeeList />

      {/* Dialogs */}
      <EmployeeDetails />
      <EmployeeForm />
    </div>
  );
};

export default Employees;