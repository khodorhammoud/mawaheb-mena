import { JobApplication } from './Job';
import { AccountType, TimesheetStatus } from './enums';

export type TimesheetEntry = {
  id?: number;
  date: Date;
  startTime: number;
  endTime: number;
  description: string;
  column?: number;
  totalColumns?: number;
  isSubmitted?: boolean;
  status?: TimesheetStatus;
};

export type TimesheetDay = {
  entries: TimesheetEntry[];
  isSubmitted?: boolean;
  status?: TimesheetStatus;
};

export type TimesheetData = {
  [key: string]: TimesheetDay;
};

export type EntryPopup = {
  isOpen: boolean;
  selectedDay: string;
  selectedTime: number;
  isEdit: boolean;
  entryIndex: number | null;
};

export type TimesheetProps = {
  allowOverlap?: boolean;
  jobApplication?: JobApplication;
  accountType: AccountType;
  freelancerId?: number;
};

export type TimeSlot = {
  totalMinutes: number;
  displayString: string;
};

export type DisplayedDaysType = {
  date: Date;
  dayName: string;
  formattedDate: string;
};

export type DayTotalProps = {
  total: number;
  className?: string;
};
