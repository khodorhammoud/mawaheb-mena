import { Button } from "~/components/ui/button";
import { useTimesheet } from "../context/TimesheetContext";
import { AccountType } from "~/types/enums";

interface EmployerActionsProps {
  date: string;
  isSubmitted: boolean;
}

export function EmployerActions({ date, isSubmitted }: EmployerActionsProps) {
  const { userRole, onApproveSubmission, onRejectSubmission } = useTimesheet();

  if (userRole !== AccountType.Employer || !isSubmitted) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onApproveSubmission?.(date)}
      >
        Approve
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onRejectSubmission?.(date)}
      >
        Reject
      </Button>
    </div>
  );
}
