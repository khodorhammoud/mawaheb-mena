import { and, lte, eq, gte } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";

import {
  timesheetEntriesTable,
  timesheetSubmissionsTable,
} from "~/db/drizzle/schemas/schema";
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

export async function submitTimesheetDay(
  freelancerId: number,
  jobApplicationId: number,
  submissionDate: Date,
  totalHours: number
) {
  // Check if there are any entries for this day
  const entries = await getTimesheetEntriesFromDatabase(
    freelancerId,
    jobApplicationId,
    submissionDate,
    submissionDate
  );

  if (entries.length === 0) {
    throw new Error("Cannot submit a day with no entries");
  }

  const toDate = new Date(submissionDate);
  // set the time of the "to date" to 23:59:59
  toDate.setHours(23, 59, 59);
  // Check if already submitted
  const existingSubmissions = await getTimesheetSubmissions(
    freelancerId,
    jobApplicationId,
    submissionDate,
    toDate
  );

  if (existingSubmissions.length > 0) {
    throw new Error("This day has already been submitted");
  }

  type NewTimesheetSubmission = typeof timesheetSubmissionsTable.$inferInsert;
  const newTimesheetSubmission: NewTimesheetSubmission = {
    freelancerId,
    jobApplicationId,
    submissionDate: submissionDate.toDateString(),
    totalHours: totalHours.toString(),
  };
  console.log("newTimesheetSubmission", newTimesheetSubmission);
  const [insertedTimesheetSubmission] = await db
    .insert(timesheetSubmissionsTable)
    .values(newTimesheetSubmission)
    .returning();
  console.log("insertedTimesheetSubmission", insertedTimesheetSubmission);
  return insertedTimesheetSubmission;
}

export async function getTimesheetSubmissions(
  freelancerId: number,
  jobApplicationId: number,
  fromDate: Date,
  toDate: Date
) {
  return await db
    .select()
    .from(timesheetSubmissionsTable)
    .where(
      and(
        eq(timesheetSubmissionsTable.freelancerId, freelancerId),
        eq(timesheetSubmissionsTable.jobApplicationId, jobApplicationId),
        gte(timesheetSubmissionsTable.submissionDate, fromDate.toDateString()),
        lte(timesheetSubmissionsTable.submissionDate, toDate.toDateString())
      )
    );
}
