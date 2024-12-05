import React, { useState, useEffect, useRef } from "react";
import { TimePicker } from "~/components/ui/time-picker";
import { useToast } from "~/components/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"; // Import Tooltip components

interface TimesheetProps {
  allowOverlap?: boolean;
}

const Timesheet: React.FC<TimesheetProps> = ({ allowOverlap = false }) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [startDayIndex, setStartDayIndex] = useState(0);

  // Type for entries
  type Entry = {
    id: number;
    startTime: Date;
    endTime: Date;
    description: string;
    column?: number; // For overlap handling
    totalColumns?: number; // For overlap handling
  };

  const [timesheet, setTimesheet] = useState<{
    [key: string]: { entries: Entry[] };
  }>({
    Monday: { entries: [] },
    Tuesday: { entries: [] },
    Wednesday: { entries: [] },
    Thursday: { entries: [] },
    Friday: { entries: [] },
    Saturday: { entries: [] },
    Sunday: { entries: [] },
  });

  // Type for the popup
  type EntryPopup = {
    isOpen: boolean;
    selectedDay: string;
    selectedTime: number; // total minutes since midnight
    isEdit: boolean;
    entryIndex: number | null; // Index of the entry in the entries array
  };

  const [popup, setPopup] = useState<EntryPopup>({
    isOpen: false,
    selectedDay: "",
    selectedTime: 0,
    isEdit: false,
    entryIndex: null,
  });

  const [formData, setFormData] = useState<Entry>({
    id: Date.now(),
    startTime: new Date(),
    endTime: new Date(),
    description: "",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast(); // Get the toast function from context

  const gridGap = 8;

  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    const totalMinutes = hour * 60 + minutes;
    const displayString = `${hour % 12 === 0 ? 12 : hour % 12}:${minutes
      .toString()
      .padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
    return {
      totalMinutes,
      displayString,
    };
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
    setStartDayIndex((prevIndex) =>
      prevIndex === 0 ? days.length - 3 : prevIndex - 1
    );
  };

  const handleNextDays = () => {
    setStartDayIndex((prevIndex) =>
      prevIndex === days.length - 3 ? 0 : prevIndex + 1
    );
  };

  const handleGridClick = (day, time, clickedEntry: Entry | null = null) => {
    const isEdit = clickedEntry !== null;
    const entryIndex = isEdit
      ? timesheet[day].entries.findIndex((e) => e.id === clickedEntry.id)
      : null;

    setPopup({
      isOpen: true,
      selectedDay: day,
      selectedTime: time.totalMinutes,
      isEdit,
      entryIndex,
    });

    if (isEdit && clickedEntry) {
      // Editing existing entry
      setFormData({ ...clickedEntry });
    } else {
      // Adding new entry
      const date = new Date();
      date.setHours(Math.floor(time.totalMinutes / 60));
      date.setMinutes(time.totalMinutes % 60);
      date.setSeconds(0);
      date.setMilliseconds(0);
      setFormData({
        id: Date.now(),
        startTime: date,
        endTime: new Date(date.getTime() + 30 * 60000), // default to 30 minutes later
        description: "",
      });
    }
  };

  const calculateContinuousFill = (
    startTime: Date,
    endTime: Date,
    timeSlots
  ) => {
    const startTotalMinutes =
      startTime.getHours() * 60 + startTime.getMinutes();
    const endTotalMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    const firstSlotIndex = timeSlots.findIndex(
      (slot) =>
        startTotalMinutes >= slot.totalMinutes &&
        startTotalMinutes < slot.totalMinutes + 30
    );

    const lastSlotIndex = timeSlots.findIndex(
      (slot) =>
        endTotalMinutes > slot.totalMinutes &&
        endTotalMinutes <= slot.totalMinutes + 30
    );

    if (firstSlotIndex === -1 || lastSlotIndex === -1) return null;

    const topPercentage = ((startTotalMinutes % 30) / 30) * 100;
    const heightPercentage = ((endTotalMinutes - startTotalMinutes) / 30) * 100;
    const heightPixelsToBeAdded =
      (lastSlotIndex - firstSlotIndex) * gridGap +
      (lastSlotIndex - firstSlotIndex) * 2; // Number of slots between start and end time, adding border thickness
    return {
      topPercentage,
      heightPercentage,
      heightPixelsToBeAdded,
      firstSlotIndex,
      lastSlotIndex,
    };
  };

  // Function to process entries for a day to handle overlaps
  const processEntriesForDay = (entries: Entry[]) => {
    // Sort entries by start time
    const sortedEntries = [...entries].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    const processedEntries: Entry[] = [];
    const ongoingEntries: Entry[] = [];

    for (const entry of sortedEntries) {
      // Remove entries that have ended
      for (let i = ongoingEntries.length - 1; i >= 0; i--) {
        if (ongoingEntries[i].endTime <= entry.startTime) {
          ongoingEntries.splice(i, 1);
        }
      }

      // Assign column and totalColumns
      entry.column = ongoingEntries.length;
      ongoingEntries.push(entry);

      // Update totalColumns for all overlapping entries
      const totalColumns = ongoingEntries.length;
      ongoingEntries.forEach((e) => (e.totalColumns = totalColumns));

      processedEntries.push(entry);
    }
    return processedEntries;
  };

  const handleSave = () => {
    const { selectedDay, isEdit, entryIndex } = popup;

    if (!formData.startTime || !formData.endTime) {
      toast({
        description: "Please select a start and end time.",
      });
      return;
    }

    // Check for overlaps if overlaps are not allowed
    if (!allowOverlap) {
      const entries = timesheet[selectedDay]?.entries || [];
      const newEntryStart = formData.startTime.getTime();
      const newEntryEnd = formData.endTime.getTime();

      const isOverlapping = entries.some((entry, index) => {
        if (isEdit && index === entryIndex) {
          // Skip the current entry when editing
          return false;
        }
        const entryStart = entry.startTime.getTime();
        const entryEnd = entry.endTime.getTime();
        return (
          (newEntryStart < entryEnd && newEntryEnd > entryStart) ||
          (newEntryStart === entryStart && newEntryEnd === entryEnd)
        );
      });

      console.log("isOverlapping", isOverlapping);

      if (isOverlapping) {
        toast({
          title: "Overlap Not Allowed",
          description: "There is an overlap with another event.",
          variant: "destructive",
        });
        return;
      }
    }

    setTimesheet((prev) => {
      const entries = [...prev[selectedDay].entries];

      if (isEdit && entryIndex !== null) {
        // Update existing entry
        entries[entryIndex] = { ...formData };
      } else {
        // Add new entry
        entries.push({ ...formData });
      }

      return {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], entries },
      };
    });

    setPopup({
      isOpen: false,
      selectedDay: "",
      selectedTime: 0,
      isEdit: false,
      entryIndex: null,
    });
  };

  const handleDelete = () => {
    const { selectedDay, entryIndex } = popup;

    if (entryIndex === null) return;

    setTimesheet((prev) => {
      const entries = [...prev[selectedDay].entries];
      entries.splice(entryIndex, 1);
      return {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], entries },
      };
    });

    setPopup({
      isOpen: false,
      selectedDay: "",
      selectedTime: 0,
      isEdit: false,
      entryIndex: null,
    });
  };

  const handleClosePopup = () => {
    setPopup({
      isOpen: false,
      selectedDay: "",
      selectedTime: 0,
      isEdit: false,
      entryIndex: null,
    });
  };

  const displayedDays = [
    days[startDayIndex],
    days[(startDayIndex + 1) % days.length],
    days[(startDayIndex + 2) % days.length],
  ];

  return (
    <TooltipProvider>
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
          className={`grid grid-cols-4 gap-[8px] overflow-y-auto max-h-[600px] border border-gray-300`}
        >
          <div></div>
          {displayedDays.map((day, index) => (
            <div key={index} className="text-center font-semibold">
              {day}
            </div>
          ))}
          {timeSlots.map((time, timeIndex) => (
            <React.Fragment key={timeIndex}>
              <div className="text-right pr-2">{time.displayString}</div>
              {displayedDays.map((day, dayIndex) => {
                const entries = timesheet[day]?.entries || [];

                // Process entries to handle overlaps
                const processedEntries = processEntriesForDay(entries);

                // Find entries that should be rendered at this time slot
                const entriesToRender = processedEntries.filter((entry) => {
                  const calcResult = calculateContinuousFill(
                    entry.startTime,
                    entry.endTime,
                    timeSlots
                  );
                  if (!calcResult) return false;
                  return calcResult.firstSlotIndex === timeIndex;
                });

                if (entriesToRender.length > 0) {
                  return (
                    <div
                      key={`${dayIndex}-${timeIndex}`}
                      className="h-12 border border-gray-200 relative"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleGridClick(day, time)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleGridClick(day, time);
                        }
                      }}
                    >
                      {entriesToRender.map((entry) => {
                        const {
                          topPercentage,
                          heightPercentage,
                          heightPixelsToBeAdded,
                        } = calculateContinuousFill(
                          entry.startTime,
                          entry.endTime,
                          timeSlots
                        );
                        const totalColumns = entry.totalColumns!;
                        const gapBetweenEntries = 2; // in pixels
                        const totalGap = (totalColumns - 1) * gapBetweenEntries; // in pixels

                        const width = `calc((100% - ${totalGap}px) / ${totalColumns})`;
                        const left = `calc(((100% - ${totalGap}px) / ${totalColumns}) * ${entry.column} + ${
                          gapBetweenEntries * entry.column
                        }px)`;

                        const truncatedDescription =
                          entry.description.length > 30
                            ? entry.description.substring(0, 30) + "..."
                            : entry.description;
                        return (
                          <div
                            key={entry.id}
                            className="absolute bg-blue-200 cursor-pointer rounded-md"
                            style={{
                              top: `${topPercentage}%`,
                              height: `calc(${heightPercentage}% + ${heightPixelsToBeAdded}px)`,
                              width: width,
                              left: left,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGridClick(day, time, entry);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                handleGridClick(day, time, entry);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <Tooltip>
                              <TooltipTrigger className="w-full h-full">
                                <span className="text-xs text-center block overflow-hidden whitespace-nowrap">
                                  {truncatedDescription}
                                </span>
                              </TooltipTrigger>
                              {entry.description.length > 30 && (
                                <TooltipContent>
                                  {entry.description}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`${dayIndex}-${timeIndex}`}
                      className="h-12 border border-gray-200 relative"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleGridClick(day, time)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleGridClick(day, time);
                        }
                      }}
                    ></div>
                  );
                }
              })}
            </React.Fragment>
          ))}
        </div>

        {popup.isOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md w-80">
              <h2 className="text-lg font-semibold mb-4">
                {popup.isEdit ? "Edit Entry" : "Add Entry"}
              </h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="startTime" className="block">
                  <span className="text-gray-700">Start Time:</span>
                  <TimePicker
                    date={formData.startTime}
                    setDate={(date) =>
                      setFormData({
                        ...formData,
                        startTime: date || new Date(),
                      })
                    }
                  />
                </label>
                <label htmlFor="endTime" className="block">
                  <span className="text-gray-700">End Time:</span>
                  <TimePicker
                    date={formData.endTime}
                    setDate={(date) =>
                      setFormData({
                        ...formData,
                        endTime: date || new Date(),
                      })
                    }
                  />
                </label>
                <label htmlFor="description" className="block">
                  <span className="text-gray-700">Description:</span>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="block w-full border border-gray-300 p-2 rounded-md mt-1"
                  />
                </label>
                <div className="flex justify-end gap-2 mt-4">
                  {popup.isEdit && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                    >
                      Delete
                    </button>
                  )}
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

      <Toaster />
    </TooltipProvider>
  );
};

export default Timesheet;
