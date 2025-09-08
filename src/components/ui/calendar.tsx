import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "./../../lib/utils"
import { buttonVariants } from "./button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    props.selected as Date || new Date()
  )

  const currentYear = currentMonth.getFullYear()
  const currentMonthIndex = currentMonth.getMonth()

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Generate year options (current year ± 50 years)
  const yearOptions = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i)

  const handleMonthChange = (month: string) => {
    const monthIndex = months.indexOf(month)
    const newDate = new Date(currentYear, monthIndex, 1)
    setCurrentMonth(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), currentMonthIndex, 1)
    setCurrentMonth(newDate)
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonthIndex - 1, 1)
    setCurrentMonth(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonthIndex + 1, 1)
    setCurrentMonth(newDate)
  }

  return (
    <div className={cn("p-3", className)}>
      {/* Custom Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-2">
          {/* Month Selector */}
          <Select value={months[currentMonthIndex]} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[130px] h-7 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month} className="text-sm">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Selector */}
          <Select value={currentYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[80px] h-7 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-sm">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* DayPicker without default navigation */}
      <DayPicker
        showOutsideDays={showOutsideDays}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // Hide default caption since we have custom navigation
          caption_label: "hidden",
          nav: "hidden", // Hide default navigation
          nav_button: "hidden",
          nav_button_previous: "hidden",
          nav_button_next: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-slate-custom-500 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-pearl-100/50 [&:has([aria-selected])]:bg-pearl-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-crimson-600 text-white hover:bg-crimson-600 hover:text-white focus:bg-crimson-600 focus:text-white",
          day_today: "bg-pearl-100 text-slate-custom-700",
          day_outside:
            "day-outside text-slate-custom-400 opacity-50 aria-selected:bg-pearl-100/50 aria-selected:text-slate-custom-400 aria-selected:opacity-30",
          day_disabled: "text-slate-custom-400 opacity-50",
          day_range_middle:
            "aria-selected:bg-pearl-100 aria-selected:text-slate-custom-700",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }