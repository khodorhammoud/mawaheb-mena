import { createContext, useContext } from "react";
import { AccountType } from "~/types/enums";
import type { TimesheetEntry, TimeSlot } from "~/types/Timesheet";

interface TimesheetContextType {
  userRole: AccountType;
  canEdit: boolean;
  onEntryClick?: (
    date: Date,
    time: TimeSlot,
    entry: TimesheetEntry | null
  ) => void;
  onApproveSubmission?: (date: string) => void;
  onRejectSubmission?: (date: string) => void;
}

export const TimesheetContext = createContext<TimesheetContextType>({
  userRole: AccountType.Freelancer,
  canEdit: false,
});

export const useTimesheet = () => useContext(TimesheetContext);
