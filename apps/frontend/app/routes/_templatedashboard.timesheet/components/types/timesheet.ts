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
