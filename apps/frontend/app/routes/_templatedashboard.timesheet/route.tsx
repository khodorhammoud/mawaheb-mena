import React, { useState, useEffect, useRef } from "react";

let filledEntries = [];
const gridGap = 8;

const Timesheet = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [startDayIndex, setStartDayIndex] = useState(0);

  // a type for entries
  type Entry = {
    startTime: string;
    endTime: string;
    description: string;
  };

  const [timesheet, setTimesheet] = useState({
    Monday: { entries: [] as Entry[] },
    Tuesday: { entries: [] as Entry[] },
    Wednesday: { entries: [] as Entry[] },
    Thursday: { entries: [] as Entry[] },
    Friday: { entries: [] as Entry[] },
    Saturday: { entries: [] as Entry[] },
    Sunday: { entries: [] as Entry[] },
  });

  // a type for the popup
  type EntryPopup = {
    isOpen: boolean;
    selectedDay: string;
    selectedTime: string;
  };

  const [popup, setPopup] = useState<EntryPopup>({
    isOpen: false,
    selectedDay: "",
    selectedTime: "",
  });

  const [formData, setFormData] = useState<Entry>({
    startTime: "",
    endTime: "",
    description: "",
  });

  const scrollContainerRef = useRef(null);

  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${hour % 12 === 0 ? 12 : hour % 12}:${minutes.toString().padStart(2, "0")} ${hour < 12 ? "AM" : "PM"
      }`;
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const initialScrollIndex = 16; // Focus on 8:00 AM
      const slotHeight = 48; // Assuming 48px height per slot
      container.scrollTop = initialScrollIndex * slotHeight;
    }
  }, []);

  const handlePrevDays = () => {
    setStartDayIndex((prevIndex) => (prevIndex === 0 ? days.length - 3 : prevIndex - 1));
  };

  const handleNextDays = () => {
    setStartDayIndex((prevIndex) => (prevIndex === days.length - 3 ? 0 : prevIndex + 1));
  };

  const handleGridClick = (day, time) => {
    setPopup({ isOpen: true, selectedDay: day, selectedTime: time });
    setFormData({ startTime: time, endTime: "", description: "" });
  };

  filledEntries = [];

  const calculateContinuousFill = (startTime, endTime, timeSlots) => {
    const [startHour, startMinutes] = startTime.split(/:| /).map(Number);
    const [endHour, endMinutes] = endTime.split(/:| /).map(Number);

    const isPMStart = startTime.includes("PM");
    const isPMEnd = endTime.includes("PM");

    const startTotalMinutes = (startHour % 12 + (isPMStart ? 12 : 0)) * 60 + startMinutes;
    const endTotalMinutes = (endHour % 12 + (isPMEnd ? 12 : 0)) * 60 + endMinutes;

    const firstSlotIndex = timeSlots.findIndex((slot) => {
      const [slotHour, slotMinutes] = slot.split(/:| /).map(Number);
      const isSlotPM = slot.includes("PM");
      const slotStartMinutes = (slotHour % 12 + (isSlotPM ? 12 : 0)) * 60 + slotMinutes;
      return startTotalMinutes >= slotStartMinutes && startTotalMinutes < slotStartMinutes + 30;
    });

    const lastSlotIndex = timeSlots.findIndex((slot) => {
      const [slotHour, slotMinutes] = slot.split(/:| /).map(Number);
      const isSlotPM = slot.includes("PM");
      const slotStartMinutes = (slotHour % 12 + (isSlotPM ? 12 : 0)) * 60 + slotMinutes;
      return endTotalMinutes > slotStartMinutes && endTotalMinutes <= slotStartMinutes + 30;
    });

    if (firstSlotIndex === -1 || lastSlotIndex === -1) return null;

    const topPercentage = ((startTotalMinutes % 30) / 30) * 100;
    const heightPercentage =
      ((endTotalMinutes - startTotalMinutes) / 30) * 100
    const heightPixelsToBeAdded = (lastSlotIndex - firstSlotIndex) * gridGap + (lastSlotIndex - firstSlotIndex) * 2; // this is the number of slots between the start and end time, adding border thickness
    return {
      topPercentage,
      heightPercentage,
      heightPixelsToBeAdded,
      firstSlotIndex,
      lastSlotIndex,
    };
  };



  const handleSave = () => {
    const { selectedDay } = popup;

    setTimesheet((prev) => {
      const updatedEntries = [
        ...prev[selectedDay].entries,
        {
          startTime: formData.startTime,
          endTime: formData.endTime,
          description: formData.description,
        },
      ];
      return {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], entries: updatedEntries },
      };
    });

    setPopup({ isOpen: false, selectedDay: "", selectedTime: "" });
  };

  const handleClosePopup = () => {
    setPopup({ isOpen: false, selectedDay: "", selectedTime: "" });
  };

  const displayedDays = [
    days[startDayIndex],
    days[(startDayIndex + 1) % days.length],
    days[(startDayIndex + 2) % days.length],
  ];

  // an index statethat stores all filled entries to prevent duplication on render
  // const filledEntries = new Set<Entry>();


  return (
    <div className="flex flex-col gap-4">
      <header className="flex justify-between items-center">
        <button onClick={handlePrevDays} className="text-gray-600 text-xl">
          &lt;
        </button>
        <h1 className="text-xl font-semibold">Timesheet</h1>
        <button onClick={handleNextDays} className="text-gray-600 text-xl">
          &gt;
        </button>
      </header>
      <div
        ref={scrollContainerRef}
        className={`grid grid-cols-4 gap-[${gridGap}px] overflow-y-auto max-h-[600px] border border-gray-300`}
      >
        <div></div>
        {displayedDays.map((day, index) => (
          <div key={index} className="text-center font-semibold">
            {day}
          </div>
        ))}
        {timeSlots.map((time, timeIndex) => (
          <React.Fragment key={timeIndex}>
            <div className="text-right pr-2">{time}</div>
            {displayedDays.map((day, dayIndex) => {
              const entries = timesheet[day]?.entries || [];
              const entry = entries.find(
                (entry: Entry) =>
                  calculateContinuousFill(entry.startTime, entry.endTime, timeSlots).firstSlotIndex <=
                  timeIndex &&
                  calculateContinuousFill(entry.startTime, entry.endTime, timeSlots).lastSlotIndex >=
                  timeIndex
              );

              if (entry && !filledEntries.includes(entry.startTime)) {
                console.log("filledEntries before add", filledEntries)
                filledEntries.push(entry.startTime);
                console.log("entry", entry)
                console.log("filledEntries after add", filledEntries)
                const { topPercentage, heightPercentage, heightPixelsToBeAdded } =
                  calculateContinuousFill(entry.startTime, entry.endTime, timeSlots);
                return (
                  <div
                    key={dayIndex}
                    className="h-12 border border-gray-200 relative"
                    onClick={() => handleGridClick(day, time)}
                  >
                    <div
                      className="absolute bg-blue-200 w-full  w-[calc(100%+2px)] left-[-1px]"
                      style={{
                        top: `${topPercentage}%`,
                        height: `calc(${heightPercentage}% + ${heightPixelsToBeAdded}px)`,
                      }}
                    >
                      <span className="text-xs text-center block">{entry.description}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={dayIndex}
                  className="h-12 border border-gray-200 relative"
                  onClick={() => handleGridClick(day, time)}
                ></div>
              );
            })}
          </React.Fragment>
        ))}

      </div>

      {popup.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">Add Entry</h2>
            <div className="flex flex-col gap-2">
              <label>
                Start Time:
                <input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="block w-full border border-gray-300 p-2 rounded-md mt-1"
                />
              </label>
              <label>
                End Time:
                <input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="block w-full border border-gray-300 p-2 rounded-md mt-1"
                />
              </label>
              <label>
                Description:
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full border border-gray-300 p-2 rounded-md mt-1"
                />
              </label>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleClosePopup}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timesheet;
