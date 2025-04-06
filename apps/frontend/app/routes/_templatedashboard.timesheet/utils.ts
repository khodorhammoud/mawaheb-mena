import { TimesheetEntry } from '@mawaheb/db/src/types/Timesheet';

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

export const calculateDayTotal = (entries: TimesheetEntry[]): number => {
  return entries.reduce((total, entry) => {
    const duration = entry.endTime - entry.startTime;
    return total + duration / (1000 * 60 * 60); // Convert milliseconds to hours
  }, 0);
};
