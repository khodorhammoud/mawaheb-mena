import { useState, useEffect, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  addDays,
  setYear,
  getYear,
} from "date-fns";

type CalendarProps = {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
};

export default function Calendar({
  selectedDate,
  onDateSelect,
  onClose,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Generate years for dropdown
  const years = Array.from(
    { length: 11 },
    (_, i) => getYear(new Date()) - 5 + i
  );

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Navigate to next and previous months
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Handle year change
  const handleYearChange = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
  };

  // Render calendar days
  const renderDays = () => {
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const days = [];

    for (let i = 0; i < 42; i++) {
      const day = addDays(startDate, i);
      const isSelected =
        selectedDate && day.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={i}
          className={`p-2 text-center cursor-pointer rounded-full ${
            isSelected
              ? "bg-primaryColor text-white"
              : "hover:border hover:border-primaryColor"
          }`}
          style={{
            width: "2.5rem",
            height: "2.5rem",
          }}
          onClick={() => onDateSelect(day)}
        >
          {format(day, "d")}
        </div>
      );
    }
    return days;
  };

  return (
    <div ref={calendarRef} className="bg-white border rounded-xl p-4 shadow-lg">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 px-3 bg-gray-200 rounded hover:bg-gray-300"
        >
          &lt;
        </button>

        <div className="flex items-center gap-2">
          <span className="font-medium">{format(currentMonth, "MMMM")}</span>

          {/* Year Dropdown */}
          <select
            value={getYear(currentMonth)}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 px-3 bg-gray-200 rounded hover:bg-gray-300"
        >
          &gt;
        </button>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 gap-2 text-sm font-medium text-center text-gray-500 border-t pt-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 text-base gap-2 mt-2 border-b pb-2">
        {renderDays()}
      </div>

      {/* Buttons */}
      <div className="flex justify-end text-sm gap-2 mt-2">
        <button
          className="text-primaryColor px-2 py-1 hover:bg-gray-200 rounded-xl transition-all"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="text-primaryColor px-2 py-1 hover:bg-gray-200 rounded-xl transition-all"
          onClick={() => onDateSelect(selectedDate || new Date())}
        >
          OK
        </button>
      </div>
    </div>
  );
}
