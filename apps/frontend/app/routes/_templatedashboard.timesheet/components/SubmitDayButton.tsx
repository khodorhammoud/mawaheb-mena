import { Button } from "~/components/ui/button";
import { useFetcher } from "@remix-run/react";

interface SubmitDayButtonProps {
  date: string;
  totalHours: number;
  jobApplicationId: number;
  isSubmitted?: boolean;
}

export function SubmitDayButton({
  date,
  totalHours,
  jobApplicationId,
  isSubmitted = false,
}: SubmitDayButtonProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  if (totalHours <= 0 || isSubmitted) {
    return null;
  }

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("date", date);
    formData.append("totalHours", String(totalHours));
    formData.append("jobApplicationId", String(jobApplicationId));

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/timesheet/submit",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSubmit}
      disabled={isSubmitting || isSubmitted}
    >
      {isSubmitting ? "Submitting..." : "Submit Day"}
    </Button>
  );
}
