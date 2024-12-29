import { useEffect, useState } from "react";
import type { TimesheetEntry, EntryPopup, TimeSlot } from "~/types/Timesheet";
import { useToast } from "~/components/hooks/use-toast";
import { useFetcher } from "@remix-run/react";
import { JobApplication } from "~/types/Job";
import { subDays, addDays } from "date-fns";

export const useTimesheet = (
  allowOverlap = true,
  jobApplication: JobApplication,
  selectedDate: Date
) => {
  const timesheetFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
    timesheetEntries: (TimesheetEntry & {
      startTime: Date;
      endTime: Date;
    })[];
  }>();

  useEffect(() => {
    if (timesheetFetcher.data?.timesheetEntries) {
      const entries = timesheetFetcher.data?.timesheetEntries || [];
      const groupedEntriesByDate = entries.reduce(
        (acc, entry) => {
          // Create a new date from the UTC string
          const date = new Date(entry.date);
          // Get date string in YYYY-MM-DD format based on local time
          const dateKey = date.toLocaleDateString("en-CA");

          if (!acc[dateKey]) {
            acc[dateKey] = { entries: [] };
          }

          acc[dateKey].entries.push({
            ...entry,
            date,
            startTime: new Date(entry.startTime).getTime(),
            endTime: new Date(entry.endTime).getTime(),
          });
          return acc;
        },
        {} as { [key: string]: { entries: TimesheetEntry[] } }
      );

      setTimesheet(groupedEntriesByDate);
    }
  }, [timesheetFetcher.data]);

  // fetch timesheet entries from db
  useEffect(() => {
    const jobApplicationId = jobApplication.id;
    // fromTime is selectedDate -1 day
    const fromTime = subDays(selectedDate, 1);
    const toTime = addDays(selectedDate, 1);
    toTime.setHours(23, 59, 59, 999);
    timesheetFetcher.load(
      `/api/timesheet?jobApplicationId=${jobApplicationId}&fromTime=${fromTime}&toTime=${toTime}`
    );
  }, [selectedDate]);

  const [timesheet, setTimesheet] = useState<{
    [key: string]: { entries: TimesheetEntry[] };
  }>({});

  const [formData, setFormData] = useState<TimesheetEntry>({
    id: Date.now(),
    date: new Date(),
    startTime: new Date().getTime(),
    endTime: new Date().getTime(),
    description: "",
  });

  const [popup, setPopup] = useState<EntryPopup>({
    isOpen: false,
    selectedDay: "",
    selectedTime: 0,
    isEdit: false,
    entryIndex: null,
  });
  const { toast } = useToast();

  const handleGridClick = (
    date: Date,
    time: TimeSlot,
    clickedEntry: TimesheetEntry | null = null
  ) => {
    const isEdit = clickedEntry !== null;
    const dateKey = date.toISOString().split("T")[0];
    const entryIndex = isEdit
      ? (timesheet[dateKey]?.entries.findIndex(
          (e) => e.id === clickedEntry.id
        ) ?? null)
      : null;

    setPopup({
      isOpen: true,
      selectedDay: dateKey,
      selectedTime: time.totalMinutes,
      isEdit,
      entryIndex,
    });

    if (isEdit && clickedEntry) {
      setFormData({ ...clickedEntry });
    } else {
      const newDate = new Date(date);
      newDate.setHours(Math.floor(time.totalMinutes / 60));
      newDate.setMinutes(time.totalMinutes % 60);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setFormData({
        id: Date.now(),
        date: date,
        startTime: newDate.getTime(),
        endTime: new Date(newDate.getTime() + 30 * 60000).getTime(),
        description: "",
      });
    }
  };

  const handleSave = (formData: TimesheetEntry) => {
    const { selectedDay, isEdit, entryIndex } = popup;

    if (!formData.startTime || !formData.endTime) {
      toast({
        description: "Please select a start and end time.",
      });
      return;
    }

    if (!allowOverlap) {
      const entries = timesheet[selectedDay]?.entries || [];
      const newEntryStart = formData.startTime;
      const newEntryEnd = formData.endTime;

      const isOverlapping = entries.some((entry, index) => {
        if (isEdit && index === entryIndex) {
          return false;
        }
        const entryStart = entry.startTime;
        const entryEnd = entry.endTime;
        return (
          (newEntryStart < entryEnd && newEntryEnd > entryStart) ||
          (newEntryStart === entryStart && newEntryEnd === entryEnd)
        );
      });

      if (isOverlapping) {
        toast({
          title: "Overlap Not Allowed",
          description: "There is an overlap with another event.",
          variant: "destructive",
        });
        return;
      }
    }

    setTimesheet((prev) => {
      if (!prev[selectedDay]) {
        prev[selectedDay] = { entries: [] };
      }

      const entries = [...prev[selectedDay].entries];
      if (isEdit && entryIndex !== null) {
        entries[entryIndex] = { ...formData };
      } else {
        entries.push({ ...formData });
      }
      return {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], entries },
      };
    });
    // save to db
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("date", formData.date.toDateString());
    formDataToSubmit.append("startTime", String(formData.startTime));
    formDataToSubmit.append("endTime", String(formData.endTime));
    formDataToSubmit.append("description", formData.description);
    formDataToSubmit.append("jobApplicationId", String(jobApplication.id));

    timesheetFetcher.submit(formDataToSubmit, {
      method: "POST",
      action: "/api/timesheet",
    });

    handleClosePopup();
  };

  const handleDelete = () => {
    const { selectedDay, entryIndex } = popup;
    if (entryIndex === null) return;
    setTimesheet((prev) => {
      const entries = [...prev[selectedDay].entries];
      entries.splice(entryIndex, 1);
      return {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], entries },
      };
    });

    handleClosePopup();
  };

  const handleClosePopup = () => {
    setPopup({
      isOpen: false,
      selectedDay: "",
      selectedTime: 0,
      isEdit: false,
      entryIndex: null,
    });
  };

  return {
    timesheet,
    formData,
    setFormData,
    popup,
    setPopup,
    handleSave,
    handleGridClick,
    handleDelete,
    handleClosePopup,
  };
};
