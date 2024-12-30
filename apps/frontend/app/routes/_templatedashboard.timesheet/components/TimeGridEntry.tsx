import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  calculateContinuousFill,
  processEntriesForDay,
} from "../utils/timeEntryCalculations";
import {
  TimesheetEntry,
  // TimesheetData,
  TimeSlot,
} from "../../../types/Timesheet";

interface TimeGridEntryProps {
  day: { date: Date };
  time: TimeSlot;
  timeIndex: number;
  timesheetEntry: TimesheetEntry[];
  timeSlots: TimeSlot[];
  onEntryClick: (date: Date, time: TimeSlot, entry: TimesheetEntry) => void;
  isSubmitted: boolean;
}
export function TimeGridEntry({
  day,
  time,
  timeIndex,
  timesheetEntry,
  timeSlots,
  onEntryClick,
  isSubmitted,
}: TimeGridEntryProps) {
  const entries = timesheetEntry || [];
  const processedEntries = processEntriesForDay(entries);
  const entriesToRender = processedEntries.filter((entry) => {
    const calcResult = calculateContinuousFill(
      entry.startTime,
      entry.endTime,
      timeSlots
    );

    return calcResult.firstSlotIndex === timeIndex;
  });

  return (
    <div
      className={`h-12 border border-gray-200 relative ${
        isSubmitted ? "bg-gray-200" : "bg-white"
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onEntryClick(day.date, time, null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onEntryClick(day.date, time, null);
        }
      }}
      key={timeIndex}
    >
      {entriesToRender.map((entry) => (
        <EntryBlock
          key={entry.id}
          entry={entry}
          timeSlots={timeSlots}
          day={day}
          time={time}
          onEntryClick={onEntryClick}
          isSubmitted={isSubmitted}
        />
      ))}
    </div>
  );
}

function EntryBlock({
  entry,
  timeSlots,
  day,
  time,
  onEntryClick,
  isSubmitted,
}: {
  entry: TimesheetEntry;
  timeSlots: TimeSlot[];
  day: { date: Date };
  time: TimeSlot;
  onEntryClick: (date: Date, time: TimeSlot, entry: TimesheetEntry) => void;
  isSubmitted: boolean;
}) {
  const calcResult = calculateContinuousFill(
    entry.startTime,
    entry.endTime,
    timeSlots
  );
  const { topPercentage, heightPercentage, heightPixelsToBeAdded } = calcResult;

  const totalColumns = entry.totalColumns!;
  const gapBetweenEntries = 2;
  const totalGap = (totalColumns - 1) * gapBetweenEntries;
  const width = `calc((100% - ${totalGap}px) / ${totalColumns})`;
  const left = `calc(((100% - ${totalGap}px) / ${totalColumns}) * ${entry.column} + ${
    gapBetweenEntries * entry.column
  }px)`;

  const truncationLength =
    totalColumns === 1 ? 20 : totalColumns === 2 ? 10 : 5;
  const truncatedDescription =
    entry.description.length > truncationLength
      ? entry.description.substring(0, truncationLength) + "..."
      : entry.description;
  const isDescriptionTruncated = entry.description.length > truncationLength;

  return (
    <Tooltip>
      <TooltipTrigger asChild className="w-full h-full">
        <div
          className={`absolute bg-blue-200 cursor-pointer rounded-md z-[1] flex items-center justify-center ${
            isSubmitted ? "bg-gray-300" : "bg-blue-200"
          }`}
          style={{
            top: `${topPercentage}%`,
            height: `calc(${heightPercentage}% + ${heightPixelsToBeAdded}px)`,
            width,
            left,
          }}
          onClick={(e) => {
            e.stopPropagation();
            !isSubmitted && onEntryClick(day.date, time, entry);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onEntryClick(day.date, time, entry);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <p className="text-center">{truncatedDescription}</p>
        </div>
      </TooltipTrigger>
      {isDescriptionTruncated && (
        <TooltipContent className="max-w-[200px] bg-white">
          <p>{entry.description}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
