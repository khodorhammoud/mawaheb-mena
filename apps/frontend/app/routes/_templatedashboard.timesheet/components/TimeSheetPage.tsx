import { useState } from 'react';
import { useTimesheet } from '../hooks/useTimesheet';
import { TimeEntryDialog } from '../components/TimeEntryDialog';
import { TimeGrid } from '../components/TimeGrid';
import { TimeHeader } from '../components/TimeHeader';
import { TimesheetCalendar } from '../components/TimesheetCalendar';
import type { TimesheetProps } from '@mawaheb/db';
import { Toaster } from '~/components/ui/toaster';
import { TooltipProvider } from '~/components/ui/tooltip';
import type { LinksFunction } from '@remix-run/node';
import { TimesheetContext } from '../context/TimesheetContext';
import styles from '../styles/calendarStyles.css?url';
import { AccountType } from '@mawaheb/db';

const Timesheet: React.FC<TimesheetProps> = ({
  allowOverlap,
  jobApplication,
  accountType,
  freelancerId,
}: TimesheetProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const {
    timesheet,
    popup,
    handleSave,
    handleDelete,
    handleGridClick,
    handleClosePopup,
    formData,
    setFormData,
    handleApproveSubmission,
    handleRejectSubmission,
    handleTimesheetActions,
    timesheetActionsState,
  } = useTimesheet(allowOverlap, jobApplication, selectedDate, accountType, freelancerId);

  const contextValue = {
    accountType,
    canEdit: accountType === AccountType.Freelancer,
    onEntryClick: accountType === AccountType.Freelancer ? handleGridClick : undefined,
    onApproveSubmission: accountType === AccountType.Employer ? handleApproveSubmission : undefined,
    onRejectSubmission: accountType === AccountType.Employer ? handleRejectSubmission : undefined,
    handleTimesheetActions:
      accountType === AccountType.Employer ? handleTimesheetActions : undefined,
    timesheetActionsState: timesheetActionsState,
  };

  return (
    <TimesheetContext.Provider value={contextValue}>
      <TooltipProvider>
        <TimeHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <div className="flex gap-4 h-full">
          <TimeGrid
            timesheet={timesheet}
            selectedDate={selectedDate}
            jobApplicationId={jobApplication.id}
            onEntryClick={handleGridClick}
          />

          <TimesheetCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            timesheet={timesheet}
          />
        </div>
        {accountType === AccountType.Freelancer && (
          <TimeEntryDialog
            popup={popup}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={handleClosePopup}
          />
        )}

        <Toaster />
      </TooltipProvider>
    </TimesheetContext.Provider>
  );
};

export default Timesheet;

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];
