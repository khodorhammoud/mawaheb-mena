import { JobApplication } from './Job';
import { AccountType, TimesheetStatus } from './enums';

export type Meridiem = 'AM' | 'PM';

export type TimeInput = {
  hour: number;
  meridiem: Meridiem; // AM | PM
};

export type TimesheetEntry = {
  id?: number;
  workDate: string;
  startAt: string;
  endAt: string;
  description?: string;
  durationHours: number;
  isSubmitted?: boolean;
  status?: TimesheetStatus;
};

export type TimesheetEntryDraft = {
  workDate: string; // 'YYYY-MM-DD'
  start: TimeInput; // { hour, meridiem }
  end: TimeInput; // { hour, meridiem }
  description?: string;
};

export type TimesheetDay = {
  entries: TimesheetEntry[];
  isSubmitted?: boolean;
  status?: TimesheetStatus;
  totalHours?: number;
};

export type TimesheetData = {
  [dateYMD: string]: TimesheetDay;
};

export type EntryPopup = {
  isOpen: boolean;
  selectedDateYMD: string | null;
  editingEntryId?: number | null;
  draft: TimesheetEntryDraft | null;
};

export type TimesheetProps = {
  allowOverlap?: boolean;
  jobApplication?: JobApplication;
  accountType: AccountType;
  freelancerId?: number;
  maxHoursPerEntry?: number;
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

export type SaveDayPayload = {
  intent: 'save-day';
  date: string; // 'YYYY-MM-DD'
  startHour: number;
  startMeridiem: Meridiem; // 'AM' | 'PM'
  endHour: number;
  endMeridiem: Meridiem; // 'AM' | 'PM'
  description?: string;
  jobApplicationId: number;
};

export type SubmitWeekPayload = {
  intent: 'submit-week';
  weekStart: string;
  jobApplicationId: number;
};

export type LoaderWeekData = {
  weekStart: string; // 'YYYY-MM-DD'
  weekEnd: string; // 'YYYY-MM-DD'
  entries: TimesheetData;
  submittedDates: string[];
};
