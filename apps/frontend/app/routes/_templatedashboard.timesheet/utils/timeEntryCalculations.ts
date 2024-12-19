import { Entry } from "../types/timesheet";

const gridGap = 8;

export const calculateContinuousFill = (
  startTime: Date,
  endTime: Date,
  timeSlots
) => {
  const startTotalMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const endTotalMinutes = endTime.getHours() * 60 + endTime.getMinutes();

  const firstSlotIndex = timeSlots.findIndex(
    (slot) =>
      startTotalMinutes >= slot.totalMinutes &&
      startTotalMinutes < slot.totalMinutes + 30
  );

  const lastSlotIndex = timeSlots.findIndex(
    (slot) =>
      endTotalMinutes > slot.totalMinutes &&
      endTotalMinutes <= slot.totalMinutes + 30
  );

  if (firstSlotIndex === -1 || lastSlotIndex === -1) return null;

  const topPercentage = ((startTotalMinutes % 30) / 30) * 100;
  const heightPercentage = ((endTotalMinutes - startTotalMinutes) / 30) * 100;
  const heightPixelsToBeAdded =
    (lastSlotIndex - firstSlotIndex) * gridGap +
    (lastSlotIndex - firstSlotIndex) * 2;
  return {
    topPercentage,
    heightPercentage,
    heightPixelsToBeAdded,
    firstSlotIndex,
    lastSlotIndex,
  };
};

export const processEntriesForDay = (entries: Entry[]) => {
  const sortedEntries = [...entries].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
  const processedEntries: Entry[] = [];
  const ongoingEntries: Entry[] = [];

  for (const entry of sortedEntries) {
    for (let i = ongoingEntries.length - 1; i >= 0; i--) {
      if (ongoingEntries[i].endTime <= entry.startTime) {
        ongoingEntries.splice(i, 1);
      }
    }

    entry.column = ongoingEntries.length;
    ongoingEntries.push(entry);
    const totalColumns = ongoingEntries.length;
    ongoingEntries.forEach((e) => (e.totalColumns = totalColumns));

    processedEntries.push(entry);
  }
  return processedEntries;
};