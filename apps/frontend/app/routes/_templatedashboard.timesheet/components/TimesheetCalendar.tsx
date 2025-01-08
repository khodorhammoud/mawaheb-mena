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
    const dateKey = date.toLocaleDateString("en-CA");
    return timesheet[dateKey]?.entries?.length > 0;
  };

  const hasEntriesApprovedForDate = (date: Date) => {
    const dateKey = date.toLocaleDateString("en-CA");
    return timesheet[dateKey]?.entries?.some(
      (entry) => entry.status === "approved"
    );
  };

  const hasEntriesRejectedForDate = (date: Date) => {
    const dateKey = date.toLocaleDateString("en-CA");
    return timesheet[dateKey]?.entries?.some(
      (entry) => entry.status === "rejected"
    );
  };

  return (
    <div className="flex-1">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          onDateSelect(date);
        }}
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
          hasEntriesSubmitted: hasEntriesForDate,
          hasEntriesApproved: hasEntriesApprovedForDate,
          hasEntriesRejected: hasEntriesRejectedForDate,
          selected: (date) =>
            date.toDateString() === selectedDate.toDateString(),
        }}
        modifiersClassNames={{
          today: "bg-blue-100 hover:bg-blue-150 transition-colors duration-75",
          hasEntriesSubmitted:
            "bg-gray-100 hover:bg-gray-200 transition-colors duration-75",
          hasEntriesApproved:
            "bg-green-100 hover:bg-green-200 transition-colors duration-75",
          hasEntriesRejected:
            "bg-red-100 hover:bg-red-200 transition-colors duration-75",
          selected:
            "bg-yellow-100 hover:bg-yellow-150 transition-colors duration-75",
        }}
      />
    </div>
  );
}
