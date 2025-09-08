import React, { useState, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { formatDateInput, validateDateFormat, parseDate } from '../../lib/dateUtils';
import { cn } from '../../lib/utils';

interface DateInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  format?: 'full' | 'month-day'; // full: dd-MM-yyyy, month-day: dd-MM
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  format = 'full',
  required = false,
  disabled = false,
  error,
  className
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    // Format the input with auto-dash insertion
    let formattedValue;
    if (format === 'full') {
      formattedValue = formatDateInput(inputVal);
    } else {
      // For increment date (dd-MM format)
      let cleaned = inputVal.replace(/[^\d-]/g, '');
      if (cleaned.length >= 2 && !cleaned.includes('-')) {
        cleaned = cleaned.substring(0, 2) + '-' + cleaned.substring(2);
      }
      if (cleaned.length > 5) {
        cleaned = cleaned.substring(0, 5);
      }
      formattedValue = cleaned;
    }

    setInputValue(formattedValue);
    onChange(formattedValue);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');

      let formattedDate;
      if (format === 'full') {
        const year = date.getFullYear();
        formattedDate = `${day}-${month}-${year}`;
      } else {
        formattedDate = `${day}-${month}`;
      }

      setInputValue(formattedDate);
      onChange(formattedDate);
      setIsCalendarOpen(false);
    }
  };

  const isValid = value ? validateDateFormat(value, format) : true;
  const parsedDate = format === 'full' ? parseDate(value) : null;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={`date-input-${label}`} className="text-sm font-medium">
          {label}
          {required && <span className="text-crimson-600 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={`date-input-${label}`}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || (format === 'full' ? 'dd-MM-yyyy' : 'dd-MM')}
          disabled={disabled}
          className={cn(
            "pr-10",
            !isValid && "border-red-500 focus:border-red-500 focus:ring-red-500",
            error && "border-red-500"
          )}
        />

        {format === 'full' && (
          <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                disabled={disabled}
              >
                <CalendarIcon className="h-4 w-4 text-slate-custom-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-auto p-0">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle>Select Date</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={parsedDate || undefined}
                onSelect={handleCalendarSelect}
                disabled={disabled}
                initialFocus
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!isValid && !error && (
        <p className="text-sm text-red-600">
          Invalid date format. Use {format === 'full' ? 'dd-MM-yyyy' : 'dd-MM'} format.
        </p>
      )}
    </div>
  );
};

export default DateInput;