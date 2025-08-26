// this Calender code is so sensetive, try to keep the content in it as it is not to break anything for dashboard and onboarding states in the availability form 👍

import { useState, useEffect, useRef } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  addDays,
  setYear,
  getYear,
  isSameDay,
} from 'date-fns';

type CalendarProps = {
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  onClose?: () => void;
  highlightedDates?: string[]; // Add this for highlighting specific dates
};

export default function Calendar({
  selectedDate,
  onDateSelect,
  onClose,
  highlightedDates = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Generate years for dropdown
  const years = Array.from({ length: 11 }, (_, i) => getYear(new Date()) - 5 + i);

  const handleClickOutside = (event: MouseEvent) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target as Node) && onClose) {
      onClose();
    }
  };
  // Close calendar when clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isHighlighted = highlightedDates.includes(format(day, 'yyyy-MM-dd'));

      days.push(
        <div
          key={i}
          className={`p-1 text-center cursor-pointer rounded-full ${
            isSelected
              ? 'bg-primaryColor text-white'
              : isHighlighted
                ? 'bg-yellow-200 border-2 border-yellow-400'
                : 'hover:border hover:border-primaryColor'
          }`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onDateSelect?.(day); // Trigger parent function
            }
          }}
          tabIndex={0}
          role="button"
          style={{
            width: '2rem',
            height: '2rem',
          }}
          onClick={() => {
            onDateSelect?.(day); // Trigger parent function
          }}
        >
          {format(day, 'd')}
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
          type="button" // Prevent form submission
          onClick={prevMonth}
          className="p-1 px-3 bg-gray-200 rounded hover:bg-gray-300"
        >
          &lt;
        </button>

        <div className="flex items-center gap-2">
          <span className="font-medium">{format(currentMonth, 'MMMM')}</span>

          {/* Year Dropdown */}
          <select
            value={getYear(currentMonth)}
            onChange={e => handleYearChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button" // Prevent form submission
          onClick={nextMonth}
          className="p-2 px-3 bg-gray-200 rounded hover:bg-gray-300"
        >
          &gt;
        </button>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 gap-2 text-sm font-medium text-center text-gray-500 border-t pt-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 text-base gap-0 mt-2 border-b pb-2">{renderDays()}</div>

      {/* Buttons */}
      <div className="flex justify-end text-sm gap-2 mt-2">
        <button
          type="button" // Prevent form submission
          className="text-primaryColor px-2 py-1 hover:bg-gray-200 rounded-xl transition-all"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button" // Prevent form submission
          className="text-primaryColor px-2 py-1 hover:bg-gray-200 rounded-xl transition-all"
          onClick={() => onDateSelect(currentMonth)}
        >
          OK
        </button>
      </div>
    </div>
  );
}
