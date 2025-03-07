import { Button } from "~/components/ui/button";
import { useTimesheet } from "../context/TimesheetContext";
import { AccountType, TimesheetStatus } from "~/types/enums";

interface EmployerActionsProps {
  date: string;
  isSubmitted: boolean;
  status: TimesheetStatus;
}

export function EmployerActions({
  date,
  isSubmitted,
  status,
}: EmployerActionsProps) {
  const { accountType, handleTimesheetActions, timesheetActionsState } =
    useTimesheet();

  if (accountType !== AccountType.Employer || !isSubmitted) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {status === TimesheetStatus.Submitted && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimesheetActions("approve", date)}
            disabled={timesheetActionsState === "submitting"}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleTimesheetActions("reject", date)}
            disabled={timesheetActionsState === "submitting"}
          >
            Reject
          </Button>
        </>
      )}

      {status === TimesheetStatus.Rejected && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTimesheetActions("approve", date)}
          disabled={timesheetActionsState === "submitting"}
        >
          Approve
        </Button>
      )}
    </div>
  );
}
