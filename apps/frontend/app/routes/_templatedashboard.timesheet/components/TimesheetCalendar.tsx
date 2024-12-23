import { Calendar } from "~/components/ui/calendar";
import type { TimesheetData } from "../../../types/Timesheet";
import { useEffect, useState } from "react";

interface TimesheetCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  timesheet: TimesheetData;
}

export function TimesheetCalendar({
  selectedDate,
  onDateSelect,
  timesheet,
}: TimesheetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  const hasEntriesForDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    return timesheet[dateKey]?.entries?.length > 0;
  };

  return (
    <div className="flex-1">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        onMonthChange={setCurrentMonth}
        month={currentMonth}
        className="shadow-md rounded-lg p-3 transition-all duration-75 float-right"
        classNames={{
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        }}
        modifiers={{
          today: (date) => date.toDateString() === new Date().toDateString(),
          hasEntries: hasEntriesForDate,
          selected: (date) =>
            date.toDateString() === selectedDate.toDateString(),
        }}
        modifiersClassNames={{
          today: "bg-blue-100 hover:bg-blue-150 transition-colors duration-75",
          hasEntries:
            "bg-gray-100 hover:bg-gray-200 transition-colors duration-75",
          selected:
            "bg-green-100 hover:bg-green-150 transition-colors duration-75",
        }}
      />
    </div>
  );
}
