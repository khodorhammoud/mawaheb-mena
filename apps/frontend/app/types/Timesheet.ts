import { JobApplication } from "~/types/Job";
import { AccountType } from "./enums";

export type TimesheetEntry = {
  id?: number;
  date: Date;
  startTime: number;
  endTime: number;
  description: string;
  column?: number;
  totalColumns?: number;
  isSubmitted?: boolean;
};

export interface TimesheetDay {
  entries: TimesheetEntry[];
  isSubmitted?: boolean;
}

export interface TimesheetData {
  [key: string]: TimesheetDay;
}

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
  accountType: AccountType;
  freelancerId?: number;
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
