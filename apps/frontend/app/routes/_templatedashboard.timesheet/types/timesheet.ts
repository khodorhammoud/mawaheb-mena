export type Entry = {
  id: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  description: string;
  column?: number;
  totalColumns?: number;
};

export type TimesheetData = {
  [key: string]: { entries: Entry[] };
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
