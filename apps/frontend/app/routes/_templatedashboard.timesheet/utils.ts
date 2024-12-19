// Define the type for a timesheet entry
export type Entry = {
  id: number; // Unique identifier for the entry
  startTime: Date; // Start time of the entry
  endTime: Date; // End time of the entry
  description: string; // Description of the entry
  column?: number; // Column position for overlapping entries
  totalColumns?: number; // Total number of overlapping columns
};

// Define the type for the popup state when adding or editing an entry
export type EntryPopup = {
  isOpen: boolean; // Whether the dialog is open
  selectedDay: string; // Day selected in the timesheet
  selectedTime: number; // Time selected in minutes since midnight
  isEdit: boolean; // Flag to indicate if editing an existing entry
  entryIndex: number | null; // Index of the entry in the entries array (if editing)
};

export const timesheetDays = {
  Monday: { entries: [] },
  Tuesday: { entries: [] },
  Wednesday: { entries: [] },
  Thursday: { entries: [] },
  Friday: { entries: [] },
  Saturday: { entries: [] },
  Sunday: { entries: [] },
};

export const handleGridClick = (
  day,
  time,
  clickedEntry: Entry | null = null
) => {
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

export const calculateDayTotal = (entries: Entry[]): number => {
  return entries.reduce((total, entry) => {
    const duration = entry.endTime.getTime() - entry.startTime.getTime();
    return total + (duration / (1000 * 60 * 60)); // Convert milliseconds to hours
  }, 0);
};