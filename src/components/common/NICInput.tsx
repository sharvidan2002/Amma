import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  validateNIC,
  convertOldNICToNew,
  formatNICForDisplay,
  extractDateOfBirthFromNIC,
  extractGenderFromNIC,
  calculateAgeFromNIC
} from '../../lib/nicConverter';
import { formatDateForDisplay } from '../../lib/dateUtils';
import { cn } from '../../lib/utils';

interface NICInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, extractedData?: {
    birthDate?: string;
    gender?: 'Male' | 'Female';
    age?: number;
  }) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  showExtractedInfo?: boolean;
}

const NICInput: React.FC<NICInputProps> = ({
  label,
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter NIC number (old or new format)",
  required = false,
  disabled = false,
  error,
  className,
  showExtractedInfo = true
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [nicInfo, setNicInfo] = useState(validateNIC(value));
  const [showConversion, setShowConversion] = useState(false);

  useEffect(() => {
    const info = validateNIC(inputValue);
    setNicInfo(info);

    // Show conversion option if it's a valid old format
    setShowConversion(info.isValid && info.format === 'old');

    // Notify parent of validation status and extracted data
    if (onValidationChange) {
      if (info.isValid && info.birthYear && info.dayOfYear) {
        const birthDate = extractDateOfBirthFromNIC(inputValue);
        const gender = extractGenderFromNIC(inputValue);
        const age = calculateAgeFromNIC(inputValue);

        onValidationChange(true, {
          birthDate: birthDate ? formatDateForDisplay(birthDate) : undefined,
          gender: gender || undefined,
          age: age || undefined
        });
      } else {
        onValidationChange(false);
      }
    }
  }, [inputValue, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanValue = e.target.value.replace(/\s/g, '').toUpperCase();

    // Allow only digits and V/X for old format
    cleanValue = cleanValue.replace(/[^0-9VX]/g, '');

    // Limit length based on format
    if (cleanValue.length <= 10 && cleanValue.match(/^\d*[VX]?$/)) {
      // Old format: up to 9 digits + V/X
      if (cleanValue.length <= 10) {
        setInputValue(cleanValue);
        onChange(cleanValue);
      }
    } else if (cleanValue.length <= 12 && cleanValue.match(/^\d+$/)) {
      // New format: exactly 12 digits
      setInputValue(cleanValue);
      onChange(cleanValue);
    }
  };

  const handleConvertToNew = () => {
    if (nicInfo.format === 'old') {
      const newNIC = convertOldNICToNew(inputValue);
      if (newNIC) {
        setInputValue(newNIC);
        onChange(newNIC);
      }
    }
  };

  const getValidationIcon = () => {
    if (!inputValue) return null;

    if (nicInfo.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getValidationMessage = () => {
    if (!inputValue) return null;

    if (nicInfo.isValid) {
      return (
        <div className="text-sm text-green-600">
          Valid {nicInfo.format === 'old' ? 'old format' : 'new format'} NIC
        </div>
      );
    } else {
      return (
        <div className="text-sm text-red-600">
          Invalid NIC format. Please enter a valid Sri Lankan NIC number.
        </div>
      );
    }
  };

  const birthDate = extractDateOfBirthFromNIC(inputValue);
  const gender = extractGenderFromNIC(inputValue);
  const age = calculateAgeFromNIC(inputValue);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="nic-input" className="text-sm font-medium">
          {label}
          {required && <span className="text-crimson-600 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id="nic-input"
          type="text"
          value={formatNICForDisplay(inputValue)}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10",
            nicInfo.isValid && inputValue ? "border-green-500" : "",
            !nicInfo.isValid && inputValue ? "border-red-500" : "",
            error && "border-red-500"
          )}
          maxLength={15} // Including spaces for formatting
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {/* Conversion Option */}
      {showConversion && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
          <div className="flex-1 text-sm text-blue-700">
            This is an old format NIC. Convert to new format?
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleConvertToNew}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Convert
          </Button>
        </div>
      )}

      {/* Extracted Information */}
      {showExtractedInfo && nicInfo.isValid && inputValue && (
        <div className="p-3 bg-pearl-50 rounded-md space-y-1">
          <div className="text-sm font-medium text-slate-custom-700">
            Extracted Information:
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-custom-600">
            {birthDate && (
              <div>
                <span className="font-medium">Birth Date:</span> {formatDateForDisplay(birthDate)}
              </div>
            )}
            {gender && (
              <div>
                <span className="font-medium">Gender:</span> {gender}
              </div>
            )}
            {age !== null && (
              <div>
                <span className="font-medium">Age:</span> {age} years
              </div>
            )}
            <div>
              <span className="font-medium">Format:</span> {nicInfo.format === 'old' ? 'Old' : 'New'}
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {getValidationMessage()}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default NICInput;