import React, { useState, useEffect, useRef } from "react";
import { TimePicker } from "~/components/ui/time-picker";
import { useToast } from "~/components/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Calendar } from "~/components/ui/calendar";

interface TimesheetProps {
  allowOverlap?: boolean;
}

const Timesheet: React.FC<TimesheetProps> = ({ allowOverlap = true }) => {
  const START_HOUR = 10; // Specify the start hour
  const END_HOUR = 18; // Specify the end hour

  /* const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [startDayIndex, setStartDayIndex] = useState(0); */
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  type Entry = {
    id: number;
    date: Date; // Add this field
    startTime: Date;
    endTime: Date;
    description: string;
    column?: number;
    totalColumns?: number;
  };

  /* const [timesheet, setTimesheet] = useState<{
    [key: string]: { entries: Entry[] };
  }>({
    Monday: { entries: [] },
    Tuesday: { entries: [] },
    Wednesday: { entries: [] },
    Thursday: { entries: [] },
    Friday: { entries: [] },
    Saturday: { entries: [] },
    Sunday: { entries: [] },
  }); */

  const [timesheet, setTimesheet] = useState<{
    [key: string]: { entries: Entry[] };
  }>({});

  type EntryPopup = {
    isOpen: boolean;
    selectedDay: string;
    selectedTime: number;
    isEdit: boolean;
    entryIndex: number | null;
  };

  const [popup, setPopup] = useState<EntryPopup>({
    isOpen: false,
    selectedDay: "",
    selectedTime: 0,
    isEdit: false,
    entryIndex: null,
  });

  const getDisplayedDates = () => {
    const currentDate = new Date(selectedDate);
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);

    return [previousDay, currentDate, nextDay];
  };

  const [formData, setFormData] = useState<Entry>({
    id: Date.now(),
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    description: "",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const gridGap = 8;

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const initialScrollIndex = 0;
      const slotHeight = 48;
      container.scrollTop = initialScrollIndex * slotHeight;
    }
  }, []);

  /* const handlePrevDays = () => {
    setStartDayIndex((prevIndex) =>
      prevIndex === 0 ? days.length - 3 : prevIndex - 1
    );
  };

  const handleNextDays = () => {
    setStartDayIndex((prevIndex) =>
      prevIndex === days.length - 3 ? 0 : prevIndex + 1
    );
  }; */

  const handleGridClick = (
    date: Date,
    time,
    clickedEntry: Entry | null = null
  ) => {
    const isEdit = clickedEntry !== null;
    const dateKey = date.toISOString().split("T")[0];
    console.log("dateKey", dateKey);
    const entryIndex = isEdit
      ? (timesheet[dateKey]?.entries.findIndex(
          (e) => e.id === clickedEntry.id
        ) ?? null)
      : null;

    setPopup({
      isOpen: true,
      selectedDay: dateKey,
      selectedTime: time.totalMinutes,
      isEdit,
      entryIndex,
    });

    if (isEdit && clickedEntry) {
      setFormData({ ...clickedEntry });
    } else {
      const newDate = new Date(date);
      newDate.setHours(Math.floor(time.totalMinutes / 60));
      newDate.setMinutes(time.totalMinutes % 60);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setFormData({
        id: Date.now(),
        date: date,
        startTime: newDate,
        endTime: new Date(newDate.getTime() + 30 * 60000),
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
      (lastSlotIndex - firstSlotIndex) * 2;
    return {
      topPercentage,
      heightPercentage,
      heightPixelsToBeAdded,
      firstSlotIndex,
      lastSlotIndex,
    };
  };

  const processEntriesForDay = (entries: Entry[]) => {
    const sortedEntries = [...entries].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
    const processedEntries: Entry[] = [];
    const ongoingEntries: Entry[] = [];

    for (const entry of sortedEntries) {
      for (let i = ongoingEntries.length - 1; i >= 0; i--) {
        if (ongoingEntries[i].endTime <= entry.startTime) {
          ongoingEntries.splice(i, 1);
        }
      }

      entry.column = ongoingEntries.length;
      ongoingEntries.push(entry);
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

    if (!allowOverlap) {
      const entries = timesheet[selectedDay]?.entries || [];
      const newEntryStart = formData.startTime.getTime();
      const newEntryEnd = formData.endTime.getTime();

      const isOverlapping = entries.some((entry, index) => {
        if (isEdit && index === entryIndex) {
          return false;
        }
        const entryStart = entry.startTime.getTime();
        const entryEnd = entry.endTime.getTime();
        return (
          (newEntryStart < entryEnd && newEntryEnd > entryStart) ||
          (newEntryStart === entryStart && newEntryEnd === entryEnd)
        );
      });

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
      if (!prev[selectedDay]) {
        prev[selectedDay] = { entries: [] };
      }

      const entries = [...prev[selectedDay].entries];
      if (isEdit && entryIndex !== null) {
        entries[entryIndex] = { ...formData };
      } else {
        entries.push({ ...formData });
      }
      console.log("================entries", {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], entries },
      });
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

  /* const displayedDays = [
    days[startDayIndex],
    days[(startDayIndex + 1) % days.length],
    days[(startDayIndex + 2) % days.length],
  ]; */
  const displayedDates = getDisplayedDates();
  const displayedDays = displayedDates.map((date) => ({
    date,
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
    formattedDate: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="w-[300px]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
        <div className="flex flex-col gap-4 flex-1">
          {/* <header className="flex justify-between items-center">
          <button onClick={handlePrevDays} className="text-gray-600 text-xl">
            &lt;
          </button>
          <h1 className="text-xl font-semibold">Timesheet</h1>
          <button onClick={handleNextDays} className="text-gray-600 text-xl">
            &gt;
          </button>
        </header> */}
          <header className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Timesheet</h1>
          </header>
          <div className="grid grid-cols-4 gap-[8px]" ref={scrollContainerRef}>
            <div></div>
            {displayedDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="font-semibold">{day.dayName}</div>
                <div className="text-sm text-gray-500">{day.formattedDate}</div>
              </div>
            ))}
            {/* <div
          ref={scrollContainerRef}
          className={`grid grid-cols-4 gap-[8px] overflow-y-auto max-h-[600px] border border-gray-300`}
        >
          <div></div>
          {displayedDays.map((day, index) => (
            <div key={index} className="text-center font-semibold">
              {day}
            </div>
          ))} */}
            {timeSlots.map((time, timeIndex) => (
              <React.Fragment key={timeIndex}>
                <div className="text-right pr-2">{time.displayString}</div>
                {displayedDays.map((day, dayIndex) => {
                  const entries =
                    timesheet[day.date.toISOString().split("T")[0]]?.entries ||
                    [];
                  const processedEntries = processEntriesForDay(entries);
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
                        onClick={() => handleGridClick(day.date, time)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleGridClick(day.date, time);
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
                          const gapBetweenEntries = 2;
                          const totalGap =
                            (totalColumns - 1) * gapBetweenEntries;
                          const width = `calc((100% - ${totalGap}px) / ${totalColumns})`;
                          const left = `calc(((100% - ${totalGap}px) / ${totalColumns}) * ${entry.column} + ${
                            gapBetweenEntries * entry.column
                          }px)`;
                          const truncationLength =
                            totalColumns == 1 ? 20 : totalColumns == 2 ? 10 : 5;
                          const truncatedDescription =
                            entry.description.length > truncationLength
                              ? entry.description.substring(
                                  0,
                                  truncationLength
                                ) + "..."
                              : entry.description;
                          const isDescriptionTruncated =
                            entry.description.length > truncationLength;

                          return (
                            <Tooltip key={entry.id}>
                              <TooltipTrigger asChild className="w-full h-full">
                                <div
                                  className="absolute bg-blue-200 cursor-pointer rounded-md z-[1] flex items-center justify-center"
                                  style={{
                                    top: `${topPercentage}%`,
                                    height: `calc(${heightPercentage}% + ${heightPixelsToBeAdded}px)`,
                                    width: width,
                                    left: left,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGridClick(day.date, time, entry);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.stopPropagation();
                                      handleGridClick(day.date, time, entry);
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <p className="text-center">
                                    {truncatedDescription}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              {isDescriptionTruncated && (
                                <TooltipContent className="max-w-[200px] bg-white">
                                  <p>{entry.description}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
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
                        onClick={() => handleGridClick(day.date, time)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleGridClick(day.date, time);
                          }
                        }}
                      ></div>
                    );
                  }
                })}
              </React.Fragment>
            ))}
          </div>

          <Dialog
            open={popup.isOpen}
            onOpenChange={(open) => !open && handleClosePopup()}
          >
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>
                  {popup.isEdit ? "Edit Entry" : "Add Entry"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 mt-4">
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
              </div>
              <DialogFooter className="mt-4">
                {popup.isEdit && (
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
                <Button variant="secondary" onClick={handleClosePopup}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
};

export default Timesheet;
