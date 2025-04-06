import { createContext, useContext } from 'react';
import { AccountType } from '@mawaheb/db/src/types/enums';
import type { TimesheetEntry, TimeSlot } from '@mawaheb/db/src/types/Timesheet';

interface TimesheetContextType {
  accountType: AccountType;
  canEdit: boolean;
  onEntryClick?: (date: Date, time: TimeSlot, entry: TimesheetEntry | null) => void;
  onApproveSubmission?: (date: string) => void;
  onRejectSubmission?: (date: string) => void;
  handleTimesheetActions?: (action: 'approve' | 'reject', date: string) => void;
  timesheetActionsState?: string;
}

export const TimesheetContext = createContext<TimesheetContextType>({
  accountType: AccountType.Freelancer,
  canEdit: false,
});

export const useTimesheet = () => useContext(TimesheetContext);
