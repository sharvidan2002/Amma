import React, { useState } from "react";
import { Download, FileText, Users } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { PrintOptions } from "../../types/common";
import { Employee } from "../../types/employee";
import { useUIStore } from "../../store/uiStore";

interface PrintButtonProps {
  type: "individual" | "bulk";
  data: Employee | Employee[];
  filters?: PrintOptions["filters"];
  disabled?: boolean;
  className?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({
  type,
  data,
  filters,
  disabled = false,
  className,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    type,
    format: "html",
    includeImage: true,
    filters,
    orientation: type === "bulk" ? "landscape" : "portrait",
  });
  const { addNotification, setButtonLoading, buttonLoading } = useUIStore();

  const handlePrint = async () => {
    setButtonLoading("print-button");

    try {
      // Generate print content
      const printContent = generatePrintContent();

      if (printOptions.format === "html") {
        // Create HTML file and trigger download
        const blob = new Blob([printContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `employee-${type}-report-${
          new Date().toISOString().split("T")[0]
        }.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Open print dialog automatically
        setTimeout(() => {
          const printWindow = window.open(url);
          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
          }
        }, 500);

        addNotification({
          type: "success",
          title: "Print Ready",
          message: "HTML file downloaded and print dialog opened.",
        });
      } else {
        // Handle PDF generation (would need backend support)
        addNotification({
          type: "info",
          title: "PDF Generation",
          message: "PDF generation is not yet implemented.",
        });
      }

      setIsDialogOpen(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      addNotification({
        type: "error",
        title: "Print Error",
        message: `Failed to generate print content. ${errorMessage}`,
      });

      // keep raw error for debugging
      console.error("Print error:", err);
    } finally {
      setButtonLoading(null);
    }
  };

  const generatePrintContent = (): string => {
    const employees = Array.isArray(data) ? data : [data];

    if (type === "individual") {
      return generateIndividualPrint(employees[0]);
    } else {
      return generateBulkPrint(employees);
    }
  };

  const generateIndividualPrint = (employee: Employee): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Details - ${employee.fullName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            background: white;
        }

        .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #dc2626;
        }

        .logo-section {
            display: flex;
            align-items: center;
        }

        .logo {
            width: 60px;
            height: 60px;
            background: #dc2626;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-right: 1rem;
        }

        .header-text h1 {
            margin: 0;
            color: #1e293b;
            font-size: 24px;
        }

        .header-text p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
        }

        .employee-photo {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            object-fit: cover;
            border: 3px solid #e2e8f0;
        }

        .employee-details {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 2rem;
            margin-top: 2rem;
        }

        .details-section {
            margin-bottom: 2rem;
        }

        .section-title {
            background: #f8fafc;
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid #dc2626;
            font-weight: bold;
            color: #1e293b;
            font-size: 16px;
        }

        .detail-row {
            display: flex;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .detail-label {
            font-weight: 600;
            color: #475569;
            min-width: 180px;
        }

        .detail-value {
            color: #1e293b;
            flex: 1;
        }

        .print-footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }

        @media print {
            body { margin: 0; }
            .print-button { display: none; }
        }
    </style>
</head>
<body>
    <div class="print-header">
        <div class="logo-section">
            <div class="logo">E</div>
            <div class="header-text">
                <h1>Employee Management System</h1>
                <p>Employee Details Report</p>
            </div>
        </div>
        ${
          printOptions.includeImage && employee.image
            ? `
            <img src="${employee.image}" alt="${employee.fullName}" class="employee-photo" />
        `
            : ""
        }
    </div>

    <div class="employee-details">
        <div>
            <div class="details-section">
                <div class="section-title">Basic Information</div>
                <div class="detail-row">
                    <span class="detail-label">Employee Number:</span>
                    <span class="detail-value">${employee.employeeNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">${employee.fullName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Designation:</span>
                    <span class="detail-value">${employee.designation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ministry:</span>
                    <span class="detail-value">${employee.ministry}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Gender:</span>
                    <span class="detail-value">${employee.gender}</span>
                </div>
            </div>

            <div class="details-section">
                <div class="section-title">Contact Information</div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">
                        ${employee.personalAddress.line1}<br/>
                        ${employee.personalAddress.line2}<br/>
                        ${employee.personalAddress.line3}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Mobile:</span>
                    <span class="detail-value">+94 ${
                      employee.mobileNumber
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${employee.emailAddress}</span>
                </div>
            </div>
        </div>

        <div>
            <div class="details-section">
                <div class="section-title">Personal Details</div>
                <div class="detail-row">
                    <span class="detail-label">NIC Number:</span>
                    <span class="detail-value">${employee.nicNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date of Birth:</span>
                    <span class="detail-value">${employee.dateOfBirth}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Age:</span>
                    <span class="detail-value">${employee.age} years</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Marital Status:</span>
                    <span class="detail-value">${employee.maritalStatus}</span>
                </div>
            </div>

            <div class="details-section">
                <div class="section-title">Employment Information</div>
                <div class="detail-row">
                    <span class="detail-label">First Appointment:</span>
                    <span class="detail-value">${
                      employee.firstAppointmentDate
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Salary Code:</span>
                    <span class="detail-value">${employee.salaryCode}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Central/Provincial:</span>
                    <span class="detail-value">${
                      employee.centralProvincial
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Service Confirmed:</span>
                    <span class="detail-value">${
                      employee.serviceConfirmed ? "Yes" : "No"
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Retirement Date:</span>
                    <span class="detail-value">${employee.retiredDate}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="print-footer">
        <p>Generated on ${new Date().toLocaleString()} | Employee Management System</p>
        <button onclick="window.print()" class="print-button" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">Print This Report</button>
    </div>
</body>
</html>`;
  };

  const generateBulkPrint = (employees: Employee[]): string => {
    const tableRows = employees
      .map(
        (emp) => `
      <tr>
        <td>${emp.employeeNumber}</td>
        <td>${emp.fullName}</td>
        <td>${emp.designation}</td>
        <td>${emp.ministry}</td>
        <td>${emp.gender}</td>
        <td>${emp.mobileNumber}</td>
        <td>${emp.nicNumber}</td>
        <td>${emp.dateOfBirth}</td>
        <td>${emp.age}</td>
        <td>${emp.salaryCode}</td>
        <td>${emp.centralProvincial}</td>
        <td>${emp.serviceConfirmed ? "Yes" : "No"}</td>
      </tr>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee List Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 15px;
            color: #333;
            background: white;
            font-size: 10px;
        }

        .print-header {
            text-align: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #dc2626;
        }

        .print-header h1 {
            margin: 0;
            color: #1e293b;
            font-size: 18px;
        }

        .print-header p {
            margin: 0.25rem 0;
            color: #64748b;
            font-size: 12px;
        }

        .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            font-size: 9px;
        }

        .print-table th,
        .print-table td {
            border: 1px solid #cbd5e1;
            padding: 4px;
            text-align: left;
            vertical-align: top;
        }

        .print-table th {
            background-color: #f8fafc;
            font-weight: bold;
            color: #1e293b;
            font-size: 8px;
        }

        .print-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .print-footer {
            margin-top: 1rem;
            text-align: center;
            color: #64748b;
            font-size: 8px;
        }

        @media print {
            body { margin: 0; font-size: 8px; }
            .print-button { display: none; }
            .print-table { font-size: 7px; }
        }

        @page {
            size: landscape;
            margin: 10mm;
        }
    </style>
</head>
<body>
    <div class="print-header">
        <h1>Employee Management System</h1>
        <p>Employee List Report</p>
        <p>Total Employees: ${
          employees.length
        } | Generated on ${new Date().toLocaleString()}</p>
    </div>

    <table class="print-table">
        <thead>
            <tr>
                <th>Employee #</th>
                <th>Full Name</th>
                <th>Designation</th>
                <th>Ministry</th>
                <th>Gender</th>
                <th>Mobile</th>
                <th>NIC</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Salary Code</th>
                <th>Central/Provincial</th>
                <th>Service Confirmed</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>

    <div class="print-footer">
        <p>Employee Management System - Generated on ${new Date().toLocaleString()}</p>
        <button onclick="window.print()" class="print-button" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">Print This Report</button>
    </div>
</body>
</html>`;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={type === "individual" ? "outline" : "default"}
          size="sm"
          disabled={disabled}
          className={className}
        >
          {type === "individual" ? (
            <FileText className="h-4 w-4 mr-2" />
          ) : (
            <Users className="h-4 w-4 mr-2" />
          )}
          {type === "individual" ? "Print Details" : "Bulk Print"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "individual"
              ? "Print Employee Details"
              : "Bulk Print Options"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="format">Output Format</Label>
            <Select
              value={printOptions.format}
              onValueChange={(value: "html" | "pdf") =>
                setPrintOptions((prev) => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML (Recommended)</SelectItem>
                <SelectItem value="pdf">PDF (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "individual" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeImage"
                checked={printOptions.includeImage}
                onChange={(e) =>
                  setPrintOptions((prev) => ({
                    ...prev,
                    includeImage: e.target.checked,
                  }))
                }
                className="rounded border-pearl-300"
              />
              <Label htmlFor="includeImage">Include employee photo</Label>
            </div>
          )}

          <div>
            <Label htmlFor="orientation">Page Orientation</Label>
            <Select
              value={printOptions.orientation}
              onValueChange={(value: "portrait" | "landscape") =>
                setPrintOptions((prev) => ({ ...prev, orientation: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            disabled={buttonLoading === "print-button"}
          >
            {buttonLoading === "print-button" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Print
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintButton;
