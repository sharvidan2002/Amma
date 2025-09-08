import { format, parse, isValid, addYears, differenceInYears } from 'date-fns';

/**
 * Date utility functions for the employee management system
 * Handles custom date formats: dd-MM-yyyy and dd-MM
 */

export function formatDateForDisplay(date: Date): string {
  return format(date, 'dd-MM-yyyy');
}

export function formatDateForStorage(dateString: string): string {
  // Input: dd-MM-yyyy or dd/MM/yyyy
  // Output: dd-MM-yyyy
  const cleanDate = dateString.replace(/\//g, '-');
  const parsed = parseDate(cleanDate);
  return parsed ? formatDateForDisplay(parsed) : dateString;
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Handle dd-MM-yyyy format
  const fullDateMatch = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (fullDateMatch) {
    const [, day, month, year] = fullDateMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isValid(date) ? date : null;
  }

  // Handle dd-MM format (current year)
  const monthDayMatch = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (monthDayMatch) {
    const [, day, month] = monthDayMatch;
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
    return isValid(date) ? date : null;
  }

  return null;
}

export function formatDateInput(value: string): string {
  // Remove any non-numeric characters except existing dashes
  let cleaned = value.replace(/[^\d\-]/g, '');

  // Handle auto-dash insertion for dd-MM-yyyy format
  if (cleaned.length >= 2 && !cleaned.includes('-')) {
    cleaned = cleaned.substring(0, 2) + '-' + cleaned.substring(2);
  }

  if (cleaned.length >= 5 && cleaned.split('-').length === 2) {
    const parts = cleaned.split('-');
    if (parts[1].length >= 2) {
      cleaned = parts[0] + '-' + parts[1].substring(0, 2) + '-' + parts[1].substring(2);
    }
  }

  // Limit to dd-MM-yyyy format
  if (cleaned.length > 10) {
    cleaned = cleaned.substring(0, 10);
  }

  return cleaned;
}

export function formatIncrementDate(value: string): string {
  // For increment date format: dd-MM
  let cleaned = value.replace(/[^\d\-]/g, '');

  if (cleaned.length >= 2 && !cleaned.includes('-')) {
    cleaned = cleaned.substring(0, 2) + '-' + cleaned.substring(2);
  }

  // Limit to dd-MM format
  if (cleaned.length > 5) {
    cleaned = cleaned.substring(0, 5);
  }

  return cleaned;
}

export function validateDateFormat(dateString: string, format: 'full' | 'month-day' = 'full'): boolean {
  if (!dateString) return false;

  if (format === 'full') {
    const regex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const match = dateString.match(regex);
    if (!match) return false;

    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isValid(date) &&
           date.getDate() === parseInt(day) &&
           date.getMonth() === parseInt(month) - 1 &&
           date.getFullYear() === parseInt(year);
  } else {
    const regex = /^(\d{1,2})-(\d{1,2})$/;
    const match = dateString.match(regex);
    if (!match) return false;

    const [, day, month] = match;
    return parseInt(day) >= 1 && parseInt(day) <= 31 &&
           parseInt(month) >= 1 && parseInt(month) <= 12;
  }
}

export function calculateAge(birthDate: Date): number {
  return differenceInYears(new Date(), birthDate);
}

export function calculateRetirementDate(birthDate: Date): Date {
  return addYears(birthDate, 60);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

export function getMonthYearString(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}

export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return false;

  return start <= end;
}

export function getDateRangeInDays(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return 0;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // Include both start and end dates
}