import { JobApplication } from "~/types/Job";

export type TimesheetEntry = {
  id?: number;
  date: Date;
  startTime: number;
  endTime: number;
  description: string;
  column?: number;
  totalColumns?: number;
};

export type TimesheetData = {
  [key: string]: { entries: TimesheetEntry[] };
};

export type EntryPopup = {
  isOpen: boolean;
  selectedDay: string;
  selectedTime: number;
  isEdit: boolean;
  entryIndex: number | null;
};

export interface TimesheetProps {
  allowOverlap?: boolean;
  jobApplication?: JobApplication;
}

export type TimeSlot = {
  totalMinutes: number;
  displayString: string;
};

export type DisplayedDaysType = {
  date: Date;
  dayName: string;
  formattedDate: string;
};

export interface DayTotalProps {
  total: number;
  className?: string;
}
