import { and, lte, eq, gte, inArray } from 'drizzle-orm';
import { db } from '@mawaheb/db/server';

import {
  timesheetEntriesTable,
  TimesheetSubmissionEntriesTable,
  timesheetSubmissionsTable,
} from '@mawaheb/db';
import { TimesheetStatus } from '@mawaheb/db/enums';
import { TimesheetEntry } from '@mawaheb/db/types';

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
  return timesheetEntries.map(entry => ({
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

// helper function to calculate the difference in hours between two dates
export function differenceInHours(startDate: Date, endDate: Date) {
  return Math.abs(endDate.getTime() - startDate.getTime()) / 3600000;
}

export async function submitTimesheetDay(
  freelancerId: number,
  jobApplicationId: number,
  submissionDate: Date
) {
  // Check if there are any entries for this day
  const entries = await getTimesheetEntriesFromDatabase(
    freelancerId,
    jobApplicationId,
    submissionDate,
    submissionDate
  );

  if (entries.length === 0) {
    throw new Error('Cannot submit a day with no entries');
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
    throw new Error('This day has already been submitted');
  }

  // calculate total hours from entries
  const totalHours = entries.reduce((acc, entry) => {
    const hours = differenceInHours(entry.endTime, entry.startTime);
    return acc + hours;
  }, 0);

  if (totalHours <= 0) {
    throw new Error('Cannot submit a day with no entries');
  }

  type NewTimesheetSubmission = typeof timesheetSubmissionsTable.$inferInsert;
  const newTimesheetSubmission: NewTimesheetSubmission = {
    freelancerId,
    jobApplicationId,
    submissionDate: submissionDate.toDateString(),
    totalHours: totalHours.toString(),
    status: TimesheetStatus.Submitted,
  };

  const [insertedTimesheetSubmission] = await db
    .insert(timesheetSubmissionsTable)
    .values(newTimesheetSubmission)
    .returning();

  // prepare entries to be inserted in the TimesheetSubmissionEntriesTable
  const timesheetSubmissionEntries = entries.map(entry => ({
    timesheetSubmissionId: insertedTimesheetSubmission.id,
    timesheetEntryId: entry.id,
  }));

  // insert the entries into the TimesheetSubmissionEntriesTable
  await db.insert(TimesheetSubmissionEntriesTable).values(timesheetSubmissionEntries);

  return insertedTimesheetSubmission;
}

export async function getTimesheetSubmissions(
  freelancerId: number,
  jobApplicationId: number,
  fromDate: Date,
  toDate: Date,
  status: TimesheetStatus[] = [
    TimesheetStatus.Submitted,
    TimesheetStatus.Approved,
    TimesheetStatus.Rejected,
    TimesheetStatus.Draft,
  ]
) {
  return await db
    .select()
    .from(timesheetSubmissionsTable)
    .where(
      and(
        eq(timesheetSubmissionsTable.freelancerId, freelancerId),
        eq(timesheetSubmissionsTable.jobApplicationId, jobApplicationId),
        gte(timesheetSubmissionsTable.submissionDate, fromDate.toDateString()),
        lte(timesheetSubmissionsTable.submissionDate, toDate.toDateString()),
        inArray(timesheetSubmissionsTable.status, status)
      )
    );
}

export async function updateTimesheetEntriesStatus(
  jobApplicationId: number,
  date: Date,
  status: TimesheetStatus
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  await db
    .update(timesheetSubmissionsTable)
    .set({ status })
    .where(
      and(
        eq(timesheetSubmissionsTable.jobApplicationId, jobApplicationId),
        gte(timesheetSubmissionsTable.submissionDate, startOfDay.toDateString()),
        lte(timesheetSubmissionsTable.submissionDate, endOfDay.toDateString())
      )
    );
}
