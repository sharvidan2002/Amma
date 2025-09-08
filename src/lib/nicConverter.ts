/**
 * NIC Converter utility for converting old format to new format
 * Old format: YY DDD SSS C + letter (V/X)
 * New format: YYYY DDD SSSS C (12 digits, no letter)
 */

export interface NICInfo {
  isValid: boolean;
  format: 'old' | 'new' | 'invalid';
  birthYear: number | null;
  dayOfYear: number | null;
  gender: 'Male' | 'Female' | null;
  serialNumber: string | null;
  checkDigit: string | null;
}

export function validateNIC(nic: string): NICInfo {
  const cleanNIC = nic.replace(/\s/g, '').toUpperCase();

  // Check if it's old format (9 digits + letter)
  const oldFormatRegex = /^(\d{2})(\d{3})(\d{3})(\d{1})([VX])$/;
  const oldMatch = cleanNIC.match(oldFormatRegex);

  if (oldMatch) {
    const [, yy, ddd, sss, c] = oldMatch;
    const dayOfYear = parseInt(ddd);
    const gender = dayOfYear > 500 ? 'Female' : 'Male';
    const actualDayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;

    // Determine century
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const previousCentury = currentCentury - 100;

    let birthYear = parseInt(yy);
    if (birthYear <= (currentYear % 100)) {
      birthYear += currentCentury;
    } else {
      birthYear += previousCentury;
    }

    return {
      isValid: isValidDayOfYear(actualDayOfYear, birthYear),
      format: 'old',
      birthYear,
      dayOfYear: actualDayOfYear,
      gender,
      serialNumber: sss,
      checkDigit: c
    };
  }

  // Check if it's new format (12 digits)
  const newFormatRegex = /^(\d{4})(\d{3})(\d{4})(\d{1})$/;
  const newMatch = cleanNIC.match(newFormatRegex);

  if (newMatch) {
    const [, yyyy, ddd, ssss, c] = newMatch;
    const birthYear = parseInt(yyyy);
    const dayOfYear = parseInt(ddd);
    const gender = dayOfYear > 500 ? 'Female' : 'Male';
    const actualDayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;

    return {
      isValid: isValidDayOfYear(actualDayOfYear, birthYear),
      format: 'new',
      birthYear,
      dayOfYear: actualDayOfYear,
      gender,
      serialNumber: ssss.substring(0, 3), // First 3 digits of the 4-digit serial
      checkDigit: c
    };
  }

  return {
    isValid: false,
    format: 'invalid',
    birthYear: null,
    dayOfYear: null,
    gender: null,
    serialNumber: null,
    checkDigit: null
  };
}

export function convertOldNICToNew(oldNIC: string): string | null {
  const cleanNIC = oldNIC.replace(/\s/g, '').toUpperCase();
  const oldFormatRegex = /^(\d{2})(\d{3})(\d{3})(\d{1})([VX])$/;
  const match = cleanNIC.match(oldFormatRegex);

  if (!match) {
    return null;
  }

  const [, yy, ddd, sss, c] = match;

  // Determine century
  const currentYear = new Date().getFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100;
  const previousCentury = currentCentury - 100;

  let birthYear = parseInt(yy);
  if (birthYear <= (currentYear % 100)) {
    birthYear += currentCentury;
  } else {
    birthYear += previousCentury;
  }

  // Convert to new format: YYYY DDD 0SSS C
  const newNIC = `${birthYear}${ddd}0${sss}${c}`;

  return newNIC;
}

export function formatNICForDisplay(nic: string): string {
  const cleanNIC = nic.replace(/\s/g, '');

  if (cleanNIC.length === 10) {
    // Old format: XX XXX XXX XV
    return `${cleanNIC.substring(0, 2)} ${cleanNIC.substring(2, 5)} ${cleanNIC.substring(5, 8)} ${cleanNIC.substring(8)}`;
  } else if (cleanNIC.length === 12) {
    // New format: XXXX XXX XXXX X
    return `${cleanNIC.substring(0, 4)} ${cleanNIC.substring(4, 7)} ${cleanNIC.substring(7, 11)} ${cleanNIC.substring(11)}`;
  }

  return nic;
}

export function extractDateOfBirthFromNIC(nic: string): Date | null {
  const nicInfo = validateNIC(nic);

  if (!nicInfo.isValid || !nicInfo.birthYear || !nicInfo.dayOfYear) {
    return null;
  }

  const year = nicInfo.birthYear;
  const dayOfYear = nicInfo.dayOfYear;

  // Create date from day of year
  const date = new Date(year, 0, dayOfYear);

  return date;
}

export function extractGenderFromNIC(nic: string): 'Male' | 'Female' | null {
  const nicInfo = validateNIC(nic);
  return nicInfo.gender;
}

function isValidDayOfYear(dayOfYear: number, year: number): boolean {
  if (dayOfYear < 1 || dayOfYear > 366) {
    return false;
  }

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const maxDays = isLeapYear ? 366 : 365;

  return dayOfYear <= maxDays;
}

export function calculateAgeFromNIC(nic: string): number | null {
  const birthDate = extractDateOfBirthFromNIC(nic);

  if (!birthDate) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function calculateRetirementDate(birthDate: Date): Date {
  const retirementDate = new Date(birthDate);
  retirementDate.setFullYear(retirementDate.getFullYear() + 60);
  return retirementDate;
}