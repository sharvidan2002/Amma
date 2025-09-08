import React, { useState } from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { useEmployeeStore } from "../../store/employeeStore";
import { EmployeeFilter } from "../../types/employee";
import { DESIGNATIONS, SALARY_CODES, GENDERS } from "../../lib/constants";

const EmployeeFilters: React.FC = () => {
  const {
    filters,
    setFilters,
    clearFilters,
    getUniqueMinistries,
    getFilteredEmployees,
  } = useEmployeeStore();

  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<EmployeeFilter>(filters);

  const ministries = getUniqueMinistries();
  const filteredEmployees = getFilteredEmployees();
  const activeFilterCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof EmployeeFilter];
    return value !== undefined && value !== "" && value !== null;
  }).length;

  const handleApplyFilters = () => {
    setFilters(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    clearFilters();
    setIsOpen(false);
  };

  type AgeRange = {
    min?: number;
    max?: number;
  };

  type FilterValue = string | number | undefined | AgeRange;

  const updateLocalFilter = (key: keyof EmployeeFilter, value: FilterValue) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const removeActiveFilter = (key: keyof EmployeeFilter) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Filter Button and Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-crimson-600 text-white text-xs rounded-full px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Filter Employees</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Filters */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-medium text-slate-custom-800">
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employee-number">Employee Number</Label>
                        <Input
                          id="employee-number"
                          placeholder="Search by employee number"
                          value={localFilters.employeeNumber || ""}
                          onChange={(e) =>
                            updateLocalFilter("employeeNumber", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input
                          id="full-name"
                          placeholder="Search by name"
                          value={localFilters.fullName || ""}
                          onChange={(e) =>
                            updateLocalFilter("fullName", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="designation">Designation</Label>
                        <Select
                          value={localFilters.designation || ""}
                          onValueChange={(value) =>
                            updateLocalFilter("designation", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Designations</SelectItem>
                            {DESIGNATIONS.map((designation) => (
                              <SelectItem key={designation} value={designation}>
                                {designation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="ministry">Ministry</Label>
                        <Select
                          value={localFilters.ministry || ""}
                          onValueChange={(value) =>
                            updateLocalFilter("ministry", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ministry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Ministries</SelectItem>
                            {ministries.map((ministry) => (
                              <SelectItem key={ministry} value={ministry}>
                                {ministry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={localFilters.gender || ""}
                          onValueChange={(value) =>
                            updateLocalFilter("gender", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Genders</SelectItem>
                            {GENDERS.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="salary-code">Salary Code</Label>
                        <Select
                          value={localFilters.salaryCode || ""}
                          onValueChange={(value) =>
                            updateLocalFilter("salaryCode", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select salary code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Salary Codes</SelectItem>
                            {SALARY_CODES.map((code) => (
                              <SelectItem key={code} value={code}>
                                {code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Filters */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-medium text-slate-custom-800">
                      Advanced Filters
                    </h3>

                    <div>
                      <Label htmlFor="nic-number">NIC Number</Label>
                      <Input
                        id="nic-number"
                        placeholder="Search by NIC (old or new format)"
                        value={localFilters.nicNumber || ""}
                        onChange={(e) =>
                          updateLocalFilter("nicNumber", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Age Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min age"
                          value={localFilters.ageRange?.min || ""}
                          onChange={(e) =>
                            updateLocalFilter("ageRange", {
                              ...localFilters.ageRange,
                              min: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max age"
                          value={localFilters.ageRange?.max || ""}
                          onChange={(e) =>
                            updateLocalFilter("ageRange", {
                              ...localFilters.ageRange,
                              max: parseInt(e.target.value) || 100,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <span className="text-sm text-slate-custom-600">
            {filteredEmployees.length} employee
            {filteredEmployees.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-custom-500 hover:text-slate-custom-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;

            let displayValue = value;
            if (key === "ageRange" && typeof value === "object") {
              displayValue = `${value.min || 0}-${value.max || 100} years`;
            }

            return (
              <div key={key} className="filter-chip group">
                <span className="capitalize">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}: {displayValue}
                </span>
                <button
                  onClick={() =>
                    removeActiveFilter(key as keyof EmployeeFilter)
                  }
                  className="ml-2 opacity-60 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeFilters;
