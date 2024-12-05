import React, { useState, useEffect, useRef } from "react";
// Import custom TimePicker component
import { TimePicker } from "~/components/ui/time-picker";
// Import custom hooks and components for toast notifications
import { useToast } from "~/components/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
// Import Tooltip components for displaying tooltips
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
// Import Button and Dialog components
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

// Define the props for the Timesheet component
interface TimesheetProps {
  allowOverlap?: boolean; // Optional prop to allow or disallow overlapping entries
}

// Define the Timesheet component
const Timesheet: React.FC<TimesheetProps> = ({ allowOverlap = true }) => {
  // List of days to display in the timesheet
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  // State to keep track of the starting index of displayed days for pagination
  const [startDayIndex, setStartDayIndex] = useState(0);

  // Define the type for a timesheet entry
  type Entry = {
    id: number; // Unique identifier for the entry
    startTime: Date; // Start time of the entry
    endTime: Date; // End time of the entry
    description: string; // Description of the entry
    column?: number; // Column position for overlapping entries
    totalColumns?: number; // Total number of overlapping columns
  };

  // State to store the timesheet entries for each day
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

  // Define the type for the popup state when adding or editing an entry
  type EntryPopup = {
    isOpen: boolean; // Whether the dialog is open
    selectedDay: string; // Day selected in the timesheet
    selectedTime: number; // Time selected in minutes since midnight
    isEdit: boolean; // Flag to indicate if editing an existing entry
    entryIndex: number | null; // Index of the entry in the entries array (if editing)
  };

  // State to manage the popup for adding/editing entries
  const [popup, setPopup] = useState<EntryPopup>({
    isOpen: false,
    selectedDay: "",
    selectedTime: 0,
    isEdit: false,
    entryIndex: null,
  });

  // State to manage form data within the dialog
  const [formData, setFormData] = useState<Entry>({
    id: Date.now(),
    startTime: new Date(),
    endTime: new Date(),
    description: "",
  });

  // Reference to the scrollable container for the timesheet grid
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Get the toast function from custom hook to display notifications
  const { toast } = useToast();

  // Gap between grid cells in pixels
  const gridGap = 8;

  // Create an array of time slots representing each 30-minute interval in a day
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

  // Scroll to 8:00 AM when the component mounts
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const initialScrollIndex = 16; // Index for 8:00 AM
      const slotHeight = 48; // Height per time slot in pixels
      container.scrollTop = initialScrollIndex * slotHeight;
    }
  }, []);

  // Handler to display the previous set of days
  const handlePrevDays = () => {
    setStartDayIndex((prevIndex) =>
      prevIndex === 0 ? days.length - 3 : prevIndex - 1
    );
  };

  // Handler to display the next set of days
  const handleNextDays = () => {
    setStartDayIndex((prevIndex) =>
      prevIndex === days.length - 3 ? 0 : prevIndex + 1
    );
  };

  // Handler for clicking on a grid cell to add or edit an entry
  const handleGridClick = (day, time, clickedEntry: Entry | null = null) => {
    const isEdit = clickedEntry !== null;
    const entryIndex = isEdit
      ? timesheet[day].entries.findIndex((e) => e.id === clickedEntry.id)
      : null;

    // Open the dialog with relevant data
    setPopup({
      isOpen: true,
      selectedDay: day,
      selectedTime: time.totalMinutes,
      isEdit,
      entryIndex,
    });

    if (isEdit && clickedEntry) {
      // Populate form data with existing entry for editing
      setFormData({ ...clickedEntry });
    } else {
      // Initialize form data for a new entry
      const date = new Date();
      date.setHours(Math.floor(time.totalMinutes / 60));
      date.setMinutes(time.totalMinutes % 60);
      date.setSeconds(0);
      date.setMilliseconds(0);
      setFormData({
        id: Date.now(),
        startTime: date,
        endTime: new Date(date.getTime() + 30 * 60000), // Default end time is 30 minutes later
        description: "",
      });
    }
  };

  // Function to calculate the visual representation of an entry in the grid
  const calculateContinuousFill = (
    startTime: Date,
    endTime: Date,
    timeSlots
  ) => {
    const startTotalMinutes =
      startTime.getHours() * 60 + startTime.getMinutes();
    const endTotalMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    // Find the indices of the start and end time slots
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

    // Calculate the top offset and height percentage for the entry
    const topPercentage = ((startTotalMinutes % 30) / 30) * 100;
    const heightPercentage = ((endTotalMinutes - startTotalMinutes) / 30) * 100;
    const heightPixelsToBeAdded =
      (lastSlotIndex - firstSlotIndex) * gridGap +
      (lastSlotIndex - firstSlotIndex) * 2; // Account for borders and gaps
    return {
      topPercentage,
      heightPercentage,
      heightPixelsToBeAdded,
      firstSlotIndex,
      lastSlotIndex,
    };
  };

  // Function to process entries for a day to handle overlapping entries
  const processEntriesForDay = (entries: Entry[]) => {
    // Sort entries by start time
    const sortedEntries = [...entries].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    const processedEntries: Entry[] = [];
    const ongoingEntries: Entry[] = [];

    for (const entry of sortedEntries) {
      // Remove entries that have ended before the current entry starts
      for (let i = ongoingEntries.length - 1; i >= 0; i--) {
        if (ongoingEntries[i].endTime <= entry.startTime) {
          ongoingEntries.splice(i, 1);
        }
      }

      // Assign column positions to handle overlaps
      entry.column = ongoingEntries.length;
      ongoingEntries.push(entry);

      // Update totalColumns for all overlapping entries
      const totalColumns = ongoingEntries.length;
      ongoingEntries.forEach((e) => (e.totalColumns = totalColumns));

      processedEntries.push(entry);
    }
    return processedEntries;
  };

  // Handler to save the entry from the dialog
  const handleSave = () => {
    const { selectedDay, isEdit, entryIndex } = popup;

    // Validate that start and end times are selected
    if (!formData.startTime || !formData.endTime) {
      toast({
        description: "Please select a start and end time.",
      });
      return;
    }

    // Check for overlapping entries if overlaps are not allowed
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

    // Update the timesheet state with the new or edited entry
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

    // Close the dialog after saving
    setPopup({
      isOpen: false,
      selectedDay: "",
      selectedTime: 0,
      isEdit: false,
      entryIndex: null,
    });
  };

  // Handler to delete an existing entry
  const handleDelete = () => {
    const { selectedDay, entryIndex } = popup;

    if (entryIndex === null) return;

    // Remove the entry from the timesheet state
    setTimesheet((prev) => {
      const entries = [...prev[selectedDay].entries];
      entries.splice(entryIndex, 1);
      return {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], entries },
      };
    });

    // Close the dialog after deleting
    setPopup({
      isOpen: false,
      selectedDay: "",
      selectedTime: 0,
      isEdit: false,
      entryIndex: null,
    });
  };

  // Handler to close the dialog without saving
  const handleClosePopup = () => {
    setPopup({
      isOpen: false,
      selectedDay: "",
      selectedTime: 0,
      isEdit: false,
      entryIndex: null,
    });
  };

  // Compute the days to display based on the starting index
  const displayedDays = [
    days[startDayIndex],
    days[(startDayIndex + 1) % days.length],
    days[(startDayIndex + 2) % days.length],
  ];

  // Render the timesheet component
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        {/* Header with navigation buttons and title */}
        <header className="flex justify-between items-center">
          <button onClick={handlePrevDays} className="text-gray-600 text-xl">
            &lt;
          </button>
          <h1 className="text-xl font-semibold">Timesheet</h1>
          <button onClick={handleNextDays} className="text-gray-600 text-xl">
            &gt;
          </button>
        </header>
        {/* Timesheet grid displaying time slots and entries */}
        <div
          ref={scrollContainerRef}
          className={`grid grid-cols-4 gap-[8px] overflow-y-auto max-h-[600px] border border-gray-300`}
        >
          {/* Empty cell in the top-left corner */}
          <div></div>
          {/* Display headers for each displayed day */}
          {displayedDays.map((day, index) => (
            <div key={index} className="text-center font-semibold">
              {day}
            </div>
          ))}
          {/* Iterate over each time slot */}
          {timeSlots.map((time, timeIndex) => (
            <React.Fragment key={timeIndex}>
              {/* Display the time label on the left */}
              <div className="text-right pr-2">{time.displayString}</div>
              {/* Iterate over each displayed day */}
              {displayedDays.map((day, dayIndex) => {
                const entries = timesheet[day]?.entries || [];

                // Process entries to handle overlaps
                const processedEntries = processEntriesForDay(entries);

                // Find entries that start at this time slot
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
                  // Render the entries in the grid cell
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
                        const gapBetweenEntries = 2; // Gap between overlapping entries in pixels
                        const totalGap = (totalColumns - 1) * gapBetweenEntries; // Total gap between entries

                        // Calculate the width and left position for the entry
                        const width = `calc((100% - ${totalGap}px) / ${totalColumns})`;
                        const left = `calc(((100% - ${totalGap}px) / ${totalColumns}) * ${entry.column} + ${
                          gapBetweenEntries * entry.column
                        }px)`;

                        // set truncation length based on the number of columns
                        const truncationLength =
                          totalColumns == 1 ? 20 : totalColumns == 2 ? 10 : 5;

                        // Truncate the description if it's too long
                        const truncatedDescription =
                          entry.description.length > truncationLength
                            ? entry.description.substring(0, truncationLength) +
                              "..."
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
                                  e.stopPropagation(); // Prevent click from propagating to the grid cell
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
                  // Render an empty grid cell
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

        {/* ShadCN Dialog for adding or editing entries */}
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
              {/* Start Time input field */}
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
              {/* End Time input field */}
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
              {/* Description input field */}
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

      {/* Toaster component to display toast notifications */}
      <Toaster />
    </TooltipProvider>
  );
};

// Export the Timesheet component as the default export
export default Timesheet;
