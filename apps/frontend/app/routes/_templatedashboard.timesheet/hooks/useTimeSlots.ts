export function useTimeSlots(selectedDate: Date) {
  const START_HOUR = 10;
  const END_HOUR = 18;

  const timeSlots = Array.from(
    { length: (END_HOUR - START_HOUR) * 2 },
    (_, i) => {
      const hour = START_HOUR + Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      const totalMinutes = hour * 60 + minutes;
      const displayString = `${hour % 12 === 0 ? 12 : hour % 12}:${minutes
        .toString()
        .padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
      return {
        totalMinutes,
        displayString,
      };
    }
  );

  const getDisplayedDates = () => {
    const currentDate = new Date(selectedDate);
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);

    return [previousDay, currentDate, nextDay];
  };

  const displayedDates = getDisplayedDates();
  const displayedDays = displayedDates.map((date) => ({
    date,
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
    formattedDate: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return { timeSlots, displayedDays };
}