import React from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useEmployeeStore } from '../../store/employeeStore';
import { useUIStore } from '../../store/uiStore';
import { Employee } from '../../types/employee';
import { formatName } from '../../lib/utils';
import PrintButton from '../common/PrintButton';

const EmployeeList: React.FC = () => {
  const {
    getPaginatedEmployees,
    getTotalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sortBy,
    sortDirection,
    setSorting,
    setSelectedEmployee
  } = useEmployeeStore();

  const {
    openEmployeeDetailsDialog,
    openEmployeeFormDialog,
    openConfirmDialog,
    addNotification
  } = useUIStore();

  const employees = getPaginatedEmployees();
  const totalPages = getTotalPages();

  const handleSort = (column: keyof Employee) => {
    const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSorting(column, newDirection);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    openEmployeeDetailsDialog();
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    openEmployeeFormDialog();
  };

  const handleDeleteEmployee = (employee: Employee) => {
    openConfirmDialog({
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`,
      onConfirm: () => {
        // Delete logic would go here
        addNotification({
          type: 'success',
          title: 'Employee Deleted',
          message: `${employee.fullName} has been deleted successfully.`
        });
      }
    });
  };

  const getSortIcon = (column: keyof Employee) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const renderPagination = () => {
    const pages = [];
    const showPages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-pearl-100 rounded-full flex items-center justify-center">
              <Eye className="h-8 w-8 text-slate-custom-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-custom-800">No employees found</h3>
              <p className="text-slate-custom-500 mt-1">
                Try adjusting your search criteria or add a new employee.
              </p>
            </div>
            <Button onClick={openEmployeeFormDialog}>
              Add First Employee
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-custom-600">Show</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-custom-600">entries</span>
        </div>

        <PrintButton
          type="bulk"
          data={employees}
          className="ml-auto"
        />
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-pearl-50"
                  onClick={() => handleSort('employeeNumber')}
                >
                  Employee # {getSortIcon('employeeNumber')}
                </TableHead>
                <TableHead>Photo</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-pearl-50"
                  onClick={() => handleSort('fullName')}
                >
                  Full Name {getSortIcon('fullName')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-pearl-50"
                  onClick={() => handleSort('designation')}
                >
                  Designation {getSortIcon('designation')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-pearl-50"
                  onClick={() => handleSort('ministry')}
                >
                  Ministry {getSortIcon('ministry')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-pearl-50"
                  onClick={() => handleSort('gender')}
                >
                  Gender {getSortIcon('gender')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-pearl-50"
                  onClick={() => handleSort('age')}
                >
                  Age {getSortIcon('age')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-pearl-50"
                  onClick={() => handleSort('salaryCode')}
                >
                  Salary {getSortIcon('salaryCode')}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id} className="table-row">
                  <TableCell className="font-medium">
                    {employee.employeeNumber}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatName(employee.fullName)}</div>
                      <div className="text-sm text-slate-custom-500">{employee.nicNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>
                    <div className="max-w-32 truncate" title={employee.ministry}>
                      {employee.ministry}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge ${employee.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                      {employee.gender}
                    </span>
                  </TableCell>
                  <TableCell>{employee.age} years</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-pearl-100 px-2 py-1 rounded">
                      {employee.salaryCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewEmployee(employee)}
                        className="h-8 w-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEmployee(employee)}
                        className="h-8 w-8"
                        title="Edit Employee"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <PrintButton
                        type="individual"
                        data={employee}
                        className="h-8 w-8 p-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEmployee(employee)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-custom-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, employees.length)} of {employees.length} entries
          </div>
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;