import { useRef } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { TimeGridEntry } from "./TimeGridEntry";
import type {
  DisplayedDaysType,
  TimesheetEntry,
  TimesheetData,
  TimeSlot,
} from "../../../types/Timesheet";
import { useTimeSlots } from "../hooks/useTimeSlots";
import { DayTotal } from "./DayTotal";
import { SubmitDayButton } from "./SubmitDayButton";
import { calculateDayTotal } from "../utils";
import { useTimesheet } from "../context/TimesheetContext";
import { AccountType } from "~/types/enums";
import { EmployerActions } from "./EmployerActions";

interface TimeGridProps {
  timesheet: TimesheetData;
  selectedDate: Date;
  jobApplicationId: number;
  onEntryClick: (date: Date, time: TimeSlot, entry: TimesheetEntry) => void;
}

export function TimeGrid({
  timesheet,
  selectedDate,
  jobApplicationId,
  onEntryClick,
}: TimeGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { timeSlots, displayedDays } = useTimeSlots(selectedDate);
  const { accountType } = useTimesheet();

  return (
    <div className="flex-[2]">
      <ScrollArea className="h-[500px] px-2">
        <div className="grid grid-cols-4 gap-[8px]" ref={scrollContainerRef}>
          {/* Header */}
          <div className="col-span-4 bg-white sticky top-0 z-10">
            <div className="grid grid-cols-4 gap-[8px]">
              <div></div>
              {displayedDays.map((day, index) => {
                return (
                  <div
                    key={index}
                    className="text-center bg-white"
                    // className="flex flex-col min-h-full border-l border-gray-200"
                  >
                    <div className="font-semibold">{day.dayName}</div>
                    <div className="text-sm text-gray-500">
                      {day.formattedDate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {timeSlots.map((time, timeIndex) => (
            <>
              <TimeGridRow
                key={timeIndex}
                time={time}
                timeIndex={timeIndex}
                displayedDays={displayedDays}
                timesheet={timesheet}
                timeSlots={timeSlots}
                onEntryClick={onEntryClick}
              />
              {/* <DayTotal total={calculateDayTotal(dayEntries)} /> */}
            </>
          ))}
        </div>
      </ScrollArea>
      <div className="grid grid-cols-4 gap-[8px]">
        <div className="mt-auto"></div>
        {displayedDays.map((day) => {
          const dateKey = day?.date?.toLocaleDateString("en-CA");
          const entries = timesheet[dateKey]?.entries || [];
          const status = timesheet[dateKey]?.entries[0].status;
          const dayTotal = calculateDayTotal(entries);

          return (
            <div
              key={dateKey}
              className="text-center bg-white"
              // className="flex flex-col min-h-full border-l border-gray-200"
            >
              <div className="mt-auto">
                <DayTotal
                  total={calculateDayTotal(entries)}
                  className="bg-gray-50"
                />
                {accountType === AccountType.Freelancer ? (
                  <SubmitDayButton
                    date={dateKey}
                    totalHours={dayTotal}
                    jobApplicationId={jobApplicationId}
                    isSubmitted={timesheet[dateKey]?.isSubmitted}
                  />
                ) : (
                  <EmployerActions
                    date={dateKey}
                    isSubmitted={timesheet[dateKey]?.isSubmitted}
                    status={status}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeGridRow({
  time,
  timeIndex,
  displayedDays,
  timesheet,
  timeSlots,
  onEntryClick,
}: {
  time: TimeSlot;
  timeIndex: number;
  displayedDays: DisplayedDaysType[];
  timesheet: TimesheetData;
  timeSlots: TimeSlot[];
  onEntryClick: (date: Date, time: TimeSlot, entry: TimesheetEntry) => void;
}) {
  return (
    <>
      <div className="text-right pr-2">{time.displayString}</div>
      {displayedDays.map((day, dayIndex) => (
        <TimeGridEntry
          key={`${dayIndex}-${timeIndex}`}
          day={day}
          time={time}
          timeIndex={timeIndex}
          timesheetEntry={
            timesheet[day?.date?.toLocaleDateString("en-CA")]?.entries || []
          }
          timeSlots={timeSlots}
          onEntryClick={onEntryClick}
          isSubmitted={
            timesheet[day?.date?.toLocaleDateString("en-CA")]?.isSubmitted
          }
          status={
            timesheet[day?.date?.toLocaleDateString("en-CA")]?.entries[0].status
          }
        />
      ))}
    </>
  );
}
