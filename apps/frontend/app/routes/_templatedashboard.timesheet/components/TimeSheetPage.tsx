import { useState } from "react";
import { useTimesheet } from "../hooks/useTimesheet";
import { TimeEntryDialog } from "../components/TimeEntryDialog";
import { TimeGrid } from "../components/TimeGrid";
import { TimeHeader } from "../components/TimeHeader";
import { TimesheetCalendar } from "../components/TimesheetCalendar";
import type { TimesheetProps } from "../../../types/Timesheet";
import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "../styles/calendarStyles.css?url";

const Timesheet: React.FC<TimesheetProps> = ({
  allowOverlap,
  jobApplication,
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
  } = useTimesheet(allowOverlap, jobApplication, selectedDate);

  return (
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

      <TimeEntryDialog
        popup={popup}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClosePopup}
      />

      <Toaster />
    </TooltipProvider>
  );
};

export default Timesheet;

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
