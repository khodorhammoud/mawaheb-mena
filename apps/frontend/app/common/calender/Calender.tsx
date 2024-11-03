// app/routes/calendar.jsx
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

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null); // State to store selected day

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

  const handleDayClick = (day) => {
    setSelectedDay(day); // Set the selected day
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4 px-4">
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
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "E";
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium text-xs -mb-1" key={i}>
          {format(addDays(startDate, i), dateFormat)[0]} {/* First letter */}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>;
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
        const cloneDay = day;
        const isSelected = selectedDay && isSameDay(day, selectedDay);

        days.push(
          <div
            className={`text-center py-2 rounded-full cursor-pointer transition-transform transform ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400"
                : isSelected
                  ? "text-white font-semibold border-primaryColor bg-primaryColor"
                  : "text-gray-900"
            }`}
            key={day.getTime()} // Using timestamp as a unique key
            onClick={() => handleDayClick(cloneDay)} // Click handler for day selection
          >
            <span className="inline-block transition-transform transform hover:scale-110 hover:bg-primaryColor hover:text-white rounded-full px-1">
              {formattedDate}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.getTime()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <motion.div
      className="border rounded-xl p-4 w-full max-w-md mx-auto"
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
