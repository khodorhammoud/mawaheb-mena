import { useState } from "react";
import type { Entry, EntryPopup, TimeSlot } from "../types/timesheet";
import { useToast } from "~/components/hooks/use-toast";

export const useTimesheet = (allowOverlap = true) => {
  const [timesheet, setTimesheet] = useState<{
    [key: string]: { entries: Entry[] };
  }>({});

  const [formData, setFormData] = useState<Entry>({
    id: Date.now(),
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
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
    clickedEntry: Entry | null = null
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
        startTime: newDate,
        endTime: new Date(newDate.getTime() + 30 * 60000),
        description: "",
      });
    }
  };

  const handleSave = (formData: Entry) => {
    const { selectedDay, isEdit, entryIndex } = popup;

    if (!formData.startTime || !formData.endTime) {
      toast({
        description: "Please select a start and end time.",
      });
      return;
    }

    if (!allowOverlap) {
      const entries = timesheet[selectedDay]?.entries || [];
      const newEntryStart = formData.startTime.getTime();
      const newEntryEnd = formData.endTime.getTime();

      const isOverlapping = entries.some((entry, index) => {
        if (isEdit && index === entryIndex) {
          return false;
        }
        const entryStart = entry.startTime.getTime();
        const entryEnd = entry.endTime.getTime();
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
