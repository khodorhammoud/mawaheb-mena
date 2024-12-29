import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function TimeHeader({ selectedDate, onDateChange }: TimeHeaderProps) {
  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  const getDateDisplay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (diffDays) {
      case -1:
        return "Yesterday";
      case 0:
        return "Today";
      case 1:
        return "Tomorrow";
      default:
        return selected.toLocaleDateString("en-CA");
    }
  };

  return (
    <>
      <header className="flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold">Timesheet</h1>
      </header>

      <div className="flex gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-lg w-[100px] flex justify-center items-center">
          {getDateDisplay()}
        </span>

        <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="my-2">
        <QuickNavigationButtons onDateChange={onDateChange} />
      </div>
    </>
  );
}

function QuickNavigationButtons({
  onDateChange,
}: {
  onDateChange: (date: Date) => void;
}) {
  return (
    <>
      <Button onClick={() => onDateChange(new Date())} className="mr-2">
        Today
      </Button>
      <Button
        onClick={() => {
          const now = new Date();
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(now.setDate(diff));
          monday.setHours(0, 0, 0, 0);
          onDateChange(monday);
        }}
        className="mr-2"
      >
        This Week
      </Button>
      <Button
        onClick={() => {
          const now = new Date();
          const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          onDateChange(firstOfMonth);
        }}
        className="mr-2"
      >
        This Month
      </Button>
      <Button
        onClick={() => {
          const now = new Date();
          const firstOfYear = new Date(now.getFullYear(), 0, 1);
          onDateChange(firstOfYear);
        }}
      >
        This Year
      </Button>
    </>
  );
}
