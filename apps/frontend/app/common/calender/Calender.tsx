import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  setMonth,
  setYear,
} from "date-fns";
import { motion } from "framer-motion";

const Calendar = ({ highlightedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = Array.from({ length: 12 }, (_, i) =>
    format(setMonth(new Date(), i), "MMMM")
  );
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const handleMonthChange = (event) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(event.target.value)));
  };

  const handleYearChange = (event) => {
    setCurrentMonth(setYear(currentMonth, parseInt(event.target.value)));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 xl:text-base text-sm">
      <select
        onChange={handleMonthChange}
        value={currentMonth.getMonth()}
        className="p-2 border rounded"
      >
        {months.map((month, index) => (
          <option key={index} value={index}>
            {month}
          </option>
        ))}
      </select>
      <select
        onChange={handleYearChange}
        value={currentMonth.getFullYear()}
        className="p-2 border rounded"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = "E";
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium text-xs" key={i}>
          {format(addDays(startDate, i), dateFormat)[0]}
        </div>
      );
    }
    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);

        // Determine the index of the highlighted date
        const highlightIndex = highlightedDates.findIndex((highlightedDate) =>
          isSameDay(day, new Date(highlightedDate))
        );

        // Assign different Tailwind classes based on the index
        let highlightClass = "";
        if (highlightIndex === 0)
          highlightClass = "bg-yellow-200 text-white font-semibold";
        else if (highlightIndex === 1)
          highlightClass = "bg-yellow-300 text-white font-semibold";
        else if (highlightIndex === 2)
          highlightClass = "bg-yellow-400 text-white font-semibold";
        else if (highlightIndex >= 3)
          highlightClass = "bg-yellow-500 text-white font-semibold";

        days.push(
          <div
            className={`text-center py-1 rounded-full transition-transform transform ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400"
                : highlightIndex >= 0
                  ? highlightClass
                  : "text-gray-900"
            }`}
            key={day.getTime()}
          >
            <span className="inline-block rounded-full px-1 lg:text-sm text-xs">
              {formattedDate}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div
          className="grid grid-cols-7 xl:gap-1 gap-0 text-xs"
          key={day.getTime()}
        >
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <motion.div
      className="border rounded-xl lg:p-4 py-3 px-2 w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        key={format(currentMonth, "MMMM yyyy")}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </motion.div>
    </motion.div>
  );
};

export default Calendar;
