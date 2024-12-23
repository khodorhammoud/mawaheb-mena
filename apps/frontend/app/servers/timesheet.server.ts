import { and, lte, eq, gte } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";

import { timesheetEntriesTable } from "~/db/drizzle/schemas/schema";
import { TimesheetEntry } from "~/types/Timesheet";

export async function getTimesheetEntriesFromDatabase(
  freelancerId: number,
  jobApplicationId: number,
  fromTime: Date,
  toTime: Date
) {
  const timesheetEntries = await db
    .select()
    .from(timesheetEntriesTable)
    .where(
      and(
        eq(timesheetEntriesTable.freelancerId, freelancerId),
        eq(timesheetEntriesTable.jobApplicationId, jobApplicationId),
        gte(timesheetEntriesTable.date, fromTime.toISOString()),
        lte(timesheetEntriesTable.date, toTime.toISOString())
      )
    );
  return timesheetEntries.map((entry) => ({
    ...entry,
    date: new Date(entry.date),
  }));
}

export async function insetTimesheetEntryIntoDatabase(
  timesheetEntry: TimesheetEntry,
  freelancerId: number,
  jobApplicationId: number
) {
  const startDate = new Date(Number(timesheetEntry.startTime));
  const endDate = new Date(Number(timesheetEntry.endTime));

  const [insertedTimesheetEntry] = await db
    .insert(timesheetEntriesTable)
    .values({
      freelancerId: freelancerId,
      jobApplicationId: jobApplicationId,
      date: timesheetEntry.date.toDateString(),
      startTime: startDate,
      endTime: endDate,
      description: timesheetEntry.description,
    })
    .returning();

  return insertedTimesheetEntry;
}

export async function updateTimesheetEntryInDatabase(
  timesheetEntry: TimesheetEntry,
  freelancerId: number,
  jobApplicationId: number
) {
  return db
    .update(timesheetEntriesTable)
    .set(timesheetEntry)
    .where(
      and(
        eq(timesheetEntriesTable.id, timesheetEntry.id),
        eq(timesheetEntriesTable.freelancerId, freelancerId),
        eq(timesheetEntriesTable.jobApplicationId, jobApplicationId)
      )
    );
}

export async function deleteTimesheetEntryFromDatabase(
  timesheetEntryId: number,
  freelancerId: number,
  jobApplicationId: number
) {
  return db
    .delete(timesheetEntriesTable)
    .where(
      and(
        eq(timesheetEntriesTable.id, timesheetEntryId),
        eq(timesheetEntriesTable.freelancerId, freelancerId),
        eq(timesheetEntriesTable.jobApplicationId, jobApplicationId)
      )
    );
}
