// ~/servers/timesheet.server.ts
import { and, eq, gte, lte, inArray } from 'drizzle-orm';
import { db } from '@mawaheb/db/server';
import {
  timesheetDayEntriesTable,
  timesheetWeekEntriesTable,
  timesheetWeekDayEntriesTable,
  jobsTable,
  jobApplicationsTable,
} from '@mawaheb/db';
import { TimesheetStatus } from '@mawaheb/db/enums';
import { createNotification } from './notifications.server';
import { NotificationType } from '@mawaheb/db/enums';
type DayInsert = typeof timesheetDayEntriesTable.$inferInsert;
type WeekInsert = typeof timesheetWeekEntriesTable.$inferInsert;

/* ───────────────────────────── utils ───────────────────────────── */
function toYMD(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const da = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function startOfWeekMonday(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay(); // Sun=0..Sat=6
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function hoursBetween(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

export function isFutureYMD(dateYMD: string) {
  return dateYMD > toYMD(new Date());
}

export function isFutureDate(d: Date) {
  return toYMD(d) > toYMD(new Date());
}

// 12h → 24h
function to24(hour12: number, meridiem: 'AM' | 'PM') {
  return (hour12 % 12) + (meridiem === 'PM' ? 12 : 0);
}

// 24h Date → { hour(1..12), AM|PM }
function toHourMeridiem(dt: Date): { hour: number; meridiem: 'AM' | 'PM' } {
  const h = dt.getHours();
  const meridiem: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour = ((h + 11) % 12) + 1; // 0→12, 13→1
  return { hour, meridiem };
}

// build a Date from YMD + (1..12, 'AM'|'PM')
function buildDateFromAmPm(dateYMD: string, hour12: number, meridiem: 'AM' | 'PM') {
  const h24 = to24(hour12, meridiem);
  const d = new Date(`${dateYMD}T00:00:00`);
  d.setHours(h24, 0, 0, 0);
  return d;
}

// add days (for submitted week ranges)
function addDays(ymd: string, n: number) {
  const d = new Date(ymd + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toYMD(d);
}

/* ───────────────────────── entries: read (v2) ───────────────────────── */
export async function getTimesheetEntriesForWeek(
  freelancerId: number,
  jobApplicationId: number,
  weekStart: Date,
  weekEnd: Date
) {
  const startYMD = toYMD(weekStart);
  const endYMD = toYMD(weekEnd);

  // Pull all fields; we need startAt/endAt to derive AM/PM if discrete fields are absent.
  const rows = await db
    .select()
    .from(timesheetDayEntriesTable)
    .where(
      and(
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId),
        gte(timesheetDayEntriesTable.workDate, startYMD),
        lte(timesheetDayEntriesTable.workDate, endYMD)
      )
    );

  return rows.map(r => {
    const startAt = new Date(r.startAt as any);
    const endAt = new Date(r.endAt as any);

    // Derive discrete 12h fields for the client UI
    const s = toHourMeridiem(startAt);
    const e = toHourMeridiem(endAt);

    return {
      id: r.id,
      date: r.workDate as string,
      description: r.description || '',
      note: (r as any).note || '',
      // raw times (so loader can use them if it prefers)
      startAt,
      endAt,
      // discrete AM/PM that your DayCell displays
      startHour: s.hour,
      startMeridiem: s.meridiem as 'AM' | 'PM',
      endHour: e.hour,
      endMeridiem: e.meridiem as 'AM' | 'PM',
      // computed duration
      hours: hoursBetween(startAt, endAt),
      // include status for UI
      entryStatus: (r as any).entryStatus,
    };
  });
}

export async function getTimesheetEntriesFromDatabase(
  freelancerId: number,
  jobApplicationId: number,
  fromTime: Date,
  toTime: Date
) {
  const rows = await db
    .select()
    .from(timesheetDayEntriesTable)
    .where(
      and(
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId),
        gte(timesheetDayEntriesTable.workDate, toYMD(fromTime)),
        lte(timesheetDayEntriesTable.workDate, toYMD(toTime))
      )
    );

  return rows.map(r => ({
    ...r,
    workDate: r.workDate as string,
    startAt: new Date(r.startAt as any),
    endAt: new Date(r.endAt as any),
  }));
}

/* ───────────────────────── entries: write (v2) ───────────────────────── */

// Supports AM/PM payload *or* legacy ms payload.
// If startHour exists → we use AM/PM; else we expect startTime/endTime (ms).
export async function insetTimesheetEntryIntoDatabase(
  timesheetEntry:
    | {
        // NEW AM/PM shape
        date: string; // YMD
        startHour: number;
        startMeridiem: 'AM' | 'PM';
        endHour: number;
        endMeridiem: 'AM' | 'PM';
        description?: string | null;
      }
    | {
        // legacy shape
        date: string; // YMD
        startTime: number; // ms since epoch
        endTime: number; // ms since epoch
        description?: string | null;
      },
  freelancerId: number,
  jobApplicationId: number
) {
  const workDate = timesheetEntry.date;
  const startAt =
    'startHour' in timesheetEntry
      ? buildDateFromAmPm(workDate, timesheetEntry.startHour, timesheetEntry.startMeridiem)
      : new Date(Number((timesheetEntry as any).startTime));
  const endAt =
    'endHour' in timesheetEntry
      ? buildDateFromAmPm(workDate, timesheetEntry.endHour, timesheetEntry.endMeridiem)
      : new Date(Number((timesheetEntry as any).endTime));

  if (isFutureYMD(workDate)) throw new Error('Cannot add entries for future dates');
  if (endAt <= startAt) throw new Error('End time must be after start time');

  const duration = hoursBetween(startAt, endAt);
  if (duration > 8) throw new Error('An entry cannot exceed 8 hours');

  const [inserted] = await db
    .insert(timesheetDayEntriesTable)
    .values({
      freelancerId,
      jobApplicationId,
      workDate,
      startAt,
      endAt,
      description: (timesheetEntry as any).description ?? '',
      entryStatus: TimesheetStatus.Draft,
    } as DayInsert)
    .returning();

  return inserted;
}

// update path mirrors v2 columns
export async function updateTimesheetEntryInDatabase(
  timesheetEntry:
    | {
        id: number;
        date: string; // YMD
        startHour: number;
        startMeridiem: 'AM' | 'PM';
        endHour: number;
        endMeridiem: 'AM' | 'PM';
        description?: string | null;
      }
    | {
        id: number;
        date?: string;
        startTime?: number;
        endTime?: number;
        description?: string | null;
      },
  freelancerId: number,
  jobApplicationId: number
) {
  const patch: Record<string, any> = {};

  if ('startHour' in timesheetEntry) {
    const workDate = timesheetEntry.date;
    if (isFutureYMD(workDate)) throw new Error('Cannot edit future dates');

    patch.workDate = workDate;
    patch.startAt = buildDateFromAmPm(
      workDate,
      timesheetEntry.startHour,
      timesheetEntry.startMeridiem
    );
    patch.endAt = buildDateFromAmPm(workDate, timesheetEntry.endHour, timesheetEntry.endMeridiem);

    if (patch.endAt <= patch.startAt) throw new Error('End time must be after start time');
    if (hoursBetween(patch.startAt, patch.endAt) > 8)
      throw new Error('An entry cannot exceed 8 hours');
  } else {
    if (typeof timesheetEntry.description !== 'undefined')
      patch.description = timesheetEntry.description ?? '';
    if (timesheetEntry.date) {
      if (isFutureYMD(timesheetEntry.date)) throw new Error('Cannot edit future dates');
      patch.workDate = toYMD(timesheetEntry.date);
    }
    if (typeof (timesheetEntry as any).startTime !== 'undefined')
      patch.startAt = new Date(Number((timesheetEntry as any).startTime));
    if (typeof (timesheetEntry as any).endTime !== 'undefined')
      patch.endAt = new Date(Number((timesheetEntry as any).endTime));
    if (patch.startAt && patch.endAt) {
      if (patch.endAt <= patch.startAt) throw new Error('End time must be after start time');
      if (hoursBetween(patch.startAt, patch.endAt) > 8)
        throw new Error('An entry cannot exceed 8 hours');
    }
  }
  if (typeof (timesheetEntry as any).description !== 'undefined') {
    patch.description = (timesheetEntry as any).description ?? '';
  }

  const [updated] = await db
    .update(timesheetDayEntriesTable)
    .set(patch)
    .where(
      and(
        eq(timesheetDayEntriesTable.id, (timesheetEntry as any).id),
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId)
      )
    )
    .returning();

  return updated;
}

export async function deleteTimesheetEntryFromDatabase(
  timesheetEntryId: number,
  freelancerId: number,
  jobApplicationId: number
) {
  await db
    .delete(timesheetDayEntriesTable)
    .where(
      and(
        eq(timesheetDayEntriesTable.id, timesheetEntryId),
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId)
      )
    );
}

/* ───────────────────────── submissions (v2: WEEK) ───────────────────────── */

// returns array of YMD dates for any already-submitted week overlapping [weekStart..weekEnd]
export async function getSubmittedDatesForWeek(
  freelancerId: number,
  jobApplicationId: number,
  weekStartYMD: string,
  weekEndYMD: string
): Promise<string[]> {
  const weeks = await db
    .select()
    .from(timesheetWeekEntriesTable)
    .where(
      and(
        eq(timesheetWeekEntriesTable.freelancerId, freelancerId),
        eq(timesheetWeekEntriesTable.jobApplicationId, jobApplicationId),
        // any week where stored range overlaps the requested window
        lte(timesheetWeekEntriesTable.weekStart, weekEndYMD),
        gte(timesheetWeekEntriesTable.weekEnd, weekStartYMD),
        inArray(timesheetWeekEntriesTable.status, [
          TimesheetStatus.Submitted,
          TimesheetStatus.Approved,
          TimesheetStatus.Rejected,
        ])
      )
    );

  const locked = new Set<string>();
  for (const w of weeks) {
    let d = w.weekStart as string;
    while (d <= (w.weekEnd as string)) {
      locked.add(d);
      d = addDays(d, 1);
    }
  }
  return Array.from(locked).sort();
}

// quick check if a single YMD is locked by a submitted/approved/rejected week
export async function isDateSubmitted(
  freelancerId: number,
  jobApplicationId: number,
  dateYMD: string
): Promise<boolean> {
  const weekRows = await db
    .select({ id: timesheetWeekEntriesTable.id, status: timesheetWeekEntriesTable.status })
    .from(timesheetWeekEntriesTable)
    .where(
      and(
        eq(timesheetWeekEntriesTable.freelancerId, freelancerId),
        eq(timesheetWeekEntriesTable.jobApplicationId, jobApplicationId),
        lte(timesheetWeekEntriesTable.weekStart, dateYMD),
        gte(timesheetWeekEntriesTable.weekEnd, dateYMD),
        inArray(timesheetWeekEntriesTable.status, [
          TimesheetStatus.Submitted,
          TimesheetStatus.Approved,
          TimesheetStatus.Rejected,
        ])
      )
    )
    .limit(1);

  if (weekRows.length === 0) return false;

  const status = weekRows[0].status as TimesheetStatus;
  if (status === TimesheetStatus.Submitted || status === TimesheetStatus.Approved) return true;

  // Week is rejected: allow editing only for rejected day entries
  const dayRows = await db
    .select({ entryStatus: timesheetDayEntriesTable.entryStatus })
    .from(timesheetDayEntriesTable)
    .where(
      and(
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId),
        eq(timesheetDayEntriesTable.workDate, dateYMD)
      )
    )
    .limit(1);
  const dayStatus = (dayRows[0] as any)?.entryStatus as TimesheetStatus | undefined;
  // Lock if not rejected or resubmitted? Allow editing only if explicitly Rejected (not Resubmitted)
  if (dayStatus === TimesheetStatus.Rejected) return false; // editable
  if (dayStatus === TimesheetStatus.Resubmitted) return false; // editable until full week resubmitted
  return true; // lock others
}

// fetch week submissions within a window
export async function getTimesheetSubmissions(
  freelancerId: number,
  jobApplicationId: number,
  from: Date,
  to: Date,
  statuses: TimesheetStatus[] = [
    TimesheetStatus.Submitted,
    TimesheetStatus.Approved,
    TimesheetStatus.Rejected,
  ]
) {
  const fromYMD = toYMD(from);
  const toYMDVal = toYMD(to); // ✅ fix variable

  const rows = await db
    .select()
    .from(timesheetWeekEntriesTable)
    .where(
      and(
        eq(timesheetWeekEntriesTable.freelancerId, freelancerId),
        eq(timesheetWeekEntriesTable.jobApplicationId, jobApplicationId),
        // overlap of ranges
        lte(timesheetWeekEntriesTable.weekStart, toYMDVal),
        gte(timesheetWeekEntriesTable.weekEnd, fromYMD),
        inArray(timesheetWeekEntriesTable.status, statuses)
      )
    );

  return rows;
}

/**
 * Get employer information from a job application ID
 */
async function getEmployerFromJobApplication(jobApplicationId: number) {
  // console.log(
  //   '🔍 [EMPLOYER LOOKUP] Starting employer lookup for job application ID:',
  //   jobApplicationId
  // );

  const { jobApplicationsTable, jobsTable, employersTable, accountsTable, UsersTable } =
    await import('@mawaheb/db');
  const { eq } = await import('drizzle-orm');

  try {
    const result = await db
      .select({
        employerId: employersTable.id,
        employerAccountId: employersTable.accountId,
        employerUserId: accountsTable.userId, // Get the actual user ID
        employerCompanyName: employersTable.companyName,
        userFirstName: UsersTable.firstName,
        userLastName: UsersTable.lastName,
        userEmail: UsersTable.email,
      })
      .from(jobApplicationsTable)
      .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
      .innerJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
      .innerJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
      .innerJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
      .where(eq(jobApplicationsTable.id, jobApplicationId))
      .limit(1);

    // console.log('🔍 [EMPLOYER LOOKUP] Query result:', result);
    // console.log('🔍 [EMPLOYER LOOKUP] Found employer:', result[0] || 'No employer found');

    return result[0] || null;
  } catch (error) {
    console.error('🔍 [EMPLOYER LOOKUP] Error fetching employer:', error);
    throw error;
  }
}

/**
 * Get freelancer information from freelancer ID
 */
async function getFreelancerInfo(freelancerId: number) {
  // console.log('🔍 [FREELANCER LOOKUP] Starting freelancer lookup for freelancer ID:', freelancerId);

  const { freelancersTable, accountsTable, UsersTable } = await import('@mawaheb/db');
  const { eq } = await import('drizzle-orm');

  try {
    const result = await db
      .select({
        freelancerId: freelancersTable.id,
        accountId: freelancersTable.accountId,
        userFirstName: UsersTable.firstName,
        userLastName: UsersTable.lastName,
        userEmail: UsersTable.email,
      })
      .from(freelancersTable)
      .innerJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
      .innerJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
      .where(eq(freelancersTable.id, freelancerId))
      .limit(1);

    // console.log('🔍 [FREELANCER LOOKUP] Query result:', result);
    // console.log('🔍 [FREELANCER LOOKUP] Found freelancer:', result[0] || 'No freelancer found');

    return result[0] || null;
  } catch (error) {
    console.error('🔍 [FREELANCER LOOKUP] Error fetching freelancer:', error);
    throw error;
  }
}

// submit an entire week (idempotent per (freelancer, jobApp, weekStart))
export async function submitTimesheetWeek(
  freelancerId: number,
  jobApplicationId: number,
  weekStartYMD: string,
  currentUserId?: number // Add current user ID parameter
) {
  const weekEndYMD = addDays(weekStartYMD, 6);

  if (isFutureYMD(weekStartYMD) || isFutureYMD(weekEndYMD)) {
    throw new Error('Cannot submit a future week');
  }

  // Load all entries within the week
  const entries = await db
    .select()
    .from(timesheetDayEntriesTable)
    .where(
      and(
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId),
        gte(timesheetDayEntriesTable.workDate, weekStartYMD),
        lte(timesheetDayEntriesTable.workDate, weekEndYMD)
      )
    );

  if (entries.length === 0) throw new Error('Cannot submit an empty week');

  const totalHours = entries.reduce((acc, e) => {
    const start = new Date(e.startAt as any);
    const end = new Date(e.endAt as any);
    return acc + hoursBetween(start, end);
  }, 0);

  if (totalHours <= 0) throw new Error('Cannot submit an empty week');

  // Ensure no existing submission for this week
  const existing = await db
    .select()
    .from(timesheetWeekEntriesTable)
    .where(
      and(
        eq(timesheetWeekEntriesTable.freelancerId, freelancerId),
        eq(timesheetWeekEntriesTable.jobApplicationId, jobApplicationId),
        eq(timesheetWeekEntriesTable.weekStart, weekStartYMD)
      )
    );

  if (existing.length > 0) {
    // If there's an existing week and it's rejected, allow resubmission
    if (existing[0].status === TimesheetStatus.Rejected) {
      return await resubmitTimesheetWeek(
        freelancerId,
        jobApplicationId,
        weekStartYMD,
        currentUserId
      );
    }
    throw new Error('This week has already been submitted');
  }

  const [week] = await db
    .insert(timesheetWeekEntriesTable)
    .values({
      freelancerId,
      jobApplicationId,
      weekStart: weekStartYMD,
      weekEnd: weekEndYMD,
      submissionDate: new Date(),
      totalHours: String(totalHours),
      status: TimesheetStatus.Submitted,
    } as WeekInsert)
    .returning();

  // Link day entries snapshot
  const links = entries.map(e => ({ weekId: week.id, dayEntryId: e.id }));
  if (links.length) {
    await db.insert(timesheetWeekDayEntriesTable).values(links);
  }

  // mark all day entries in this range as submitted
  await db
    .update(timesheetDayEntriesTable)
    .set({ entryStatus: TimesheetStatus.Submitted } as Partial<DayInsert>)
    .where(
      and(
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId),
        gte(timesheetDayEntriesTable.workDate, weekStartYMD),
        lte(timesheetDayEntriesTable.workDate, weekEndYMD)
      )
    );

  // return all dates of the submitted week to lock UI
  const submittedDates: string[] = [];
  let d = weekStartYMD;
  while (d <= weekEndYMD) {
    submittedDates.push(d);
    d = addDays(d, 1);
  }

  // Send notifications to both employer and freelancer (don't let notification failure break timesheet submission)
  // console.log('🔔 [TIMESHEET] Starting notification process...');
  // console.log('🔔 [TIMESHEET] Job Application ID:', jobApplicationId);
  // console.log('🔔 [TIMESHEET] Freelancer ID:', freelancerId);
  // console.log('🔔 [TIMESHEET] Week Start:', weekStartYMD);
  // console.log('🔔 [TIMESHEET] Week End:', weekEndYMD);
  // console.log('🔔 [TIMESHEET] Total Hours:', totalHours);
  // console.log('🔔 [TIMESHEET] Week ID:', week.id);

  try {
    // console.log('🔔 [TIMESHEET] Fetching employer info...');
    const employer = await getEmployerFromJobApplication(jobApplicationId);
    // console.log('🔔 [TIMESHEET] Employer info:', employer);

    // console.log('🔔 [TIMESHEET] Fetching freelancer info...');
    const freelancer = await getFreelancerInfo(freelancerId);
    // console.log('🔔 [TIMESHEET] Freelancer info:', freelancer);

    if (employer && freelancer) {
      // console.log('🔔 [TIMESHEET] Both employer and freelancer found, sending notifications...');

      // Send notification to employer
      // console.log('🔔 [TIMESHEET] Sending notification to employer...');
      // console.log('🔔 [TIMESHEET] Employer Account ID:', employer.employerAccountId);
      // console.log('🔔 [TIMESHEET] Employer User ID:', employer.employerUserId);
      // console.log('🔔 [TIMESHEET] Employer Company Name:', employer.employerCompanyName);
      // console.log(
      //   '🔔 [TIMESHEET] Employer User Name:',
      //   `${employer.userFirstName} ${employer.userLastName}`
      // );

      const employerNotification = await createNotification({
        userId: employer.employerUserId, // Use the actual user ID, not account ID
        type: NotificationType.StatusUpdate,
        title: 'Timesheet Submitted',
        message: `${freelancer.userFirstName} ${freelancer.userLastName} has submitted their timesheet for the week of ${weekStartYMD} to ${weekEndYMD}. Please review and approve.`,
        payload: {
          timesheetId: week.id,
          freelancerName: `${freelancer.userFirstName} ${freelancer.userLastName}`,
          weekStart: weekStartYMD,
          weekEnd: weekEndYMD,
          totalHours: totalHours,
        },
      });
      // console.log('🔔 [TIMESHEET] Employer notification created:', employerNotification);

      // Send confirmation notification to freelancer
      // console.log('🔔 [TIMESHEET] Sending notification to freelancer...');
      // console.log('🔔 [TIMESHEET] Freelancer Account ID:', freelancer.accountId);
      // console.log(
      //   '🔔 [TIMESHEET] Freelancer Name:',
      //   `${freelancer.userFirstName} ${freelancer.userLastName}`
      // );

      const freelancerNotification = await createNotification({
        userId: currentUserId || freelancer.accountId, // Use current user ID if available, fallback to account ID
        type: NotificationType.StatusUpdate,
        title: 'Timesheet Submission Confirmed',
        message: `Your timesheet for ${weekStartYMD} to ${weekEndYMD} has been submitted to ${employer.employerCompanyName || employer.userFirstName + ' ' + employer.userLastName}. They will review and approve it.`,
        payload: {
          timesheetId: week.id,
          employerName:
            employer.employerCompanyName || `${employer.userFirstName} ${employer.userLastName}`,
          weekStart: weekStartYMD,
          weekEnd: weekEndYMD,
          totalHours: totalHours,
        },
      });
      // console.log('🔔 [TIMESHEET] Freelancer notification created:', freelancerNotification);
      // console.log(
      //   '🔔 [TIMESHEET] Freelancer notification userId:',
      //   currentUserId || freelancer.accountId
      // );
      // console.log(
      //   '🔔 [TIMESHEET] Freelancer notification should be visible to user with ID:',
      //   currentUserId || freelancer.accountId
      // );

      // console.log('🔔 [TIMESHEET] ✅ Both notifications sent successfully!');
    } else {
      // console.log('🔔 [TIMESHEET] ❌ Missing employer or freelancer info:');
      // console.log('🔔 [TIMESHEET] Employer found:', !!employer);
      // console.log('🔔 [TIMESHEET] Freelancer found:', !!freelancer);
    }
  } catch (error) {
    console.error('🔔 [TIMESHEET] ❌ Failed to send notifications:', error);
    console.error('🔔 [TIMESHEET] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
    });
    // Don't throw - notification failure shouldn't break timesheet submission
  }

  return { week, submittedDates };
}

/* ─────────────────── resubmitTimesheetWeek ─────────────────── */
export async function resubmitTimesheetWeek(
  freelancerId: number,
  jobApplicationId: number,
  weekStartYMD: string,
  currentUserId?: number
) {
  const weekEndYMD = addDays(weekStartYMD, 6);

  // Get the existing week entry
  const existing = await db
    .select()
    .from(timesheetWeekEntriesTable)
    .where(
      and(
        eq(timesheetWeekEntriesTable.freelancerId, freelancerId),
        eq(timesheetWeekEntriesTable.jobApplicationId, jobApplicationId),
        eq(timesheetWeekEntriesTable.weekStart, weekStartYMD)
      )
    )
    .limit(1);

  if (!existing[0] || existing[0].status !== TimesheetStatus.Rejected) {
    throw new Error('No rejected week found for resubmission');
  }

  // Load all current entries within the week
  const entries = await db
    .select()
    .from(timesheetDayEntriesTable)
    .where(
      and(
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId),
        gte(timesheetDayEntriesTable.workDate, weekStartYMD),
        lte(timesheetDayEntriesTable.workDate, weekEndYMD)
      )
    );

  if (entries.length === 0) throw new Error('Cannot resubmit an empty week');

  // Check if there are any remaining rejected entries
  const rejectedEntries = entries.filter(e => (e as any).entryStatus === TimesheetStatus.Rejected);
  if (rejectedEntries.length > 0) {
    throw new Error('Cannot resubmit week while there are still rejected entries');
  }

  const totalHours = entries.reduce((acc, e) => {
    const start = new Date(e.startAt as any);
    const end = new Date(e.endAt as any);
    return acc + hoursBetween(start, end);
  }, 0);

  if (totalHours <= 0) throw new Error('Cannot resubmit an empty week');

  // Update the week entry status back to submitted
  await db
    .update(timesheetWeekEntriesTable)
    .set({
      status: TimesheetStatus.Submitted,
      submissionDate: new Date(),
      totalHours: String(totalHours),
      updatedAt: new Date(),
    } as any)
    .where(eq(timesheetWeekEntriesTable.id, existing[0].id));

  // Update all resubmitted day entries back to submitted (preserve approved entries)
  await db
    .update(timesheetDayEntriesTable)
    .set({
      entryStatus: TimesheetStatus.Submitted,
      updatedAt: new Date(),
    } as any)
    .where(
      and(
        eq(timesheetDayEntriesTable.freelancerId, freelancerId),
        eq(timesheetDayEntriesTable.jobApplicationId, jobApplicationId),
        gte(timesheetDayEntriesTable.workDate, weekStartYMD),
        lte(timesheetDayEntriesTable.workDate, weekEndYMD),
        eq(timesheetDayEntriesTable.entryStatus, TimesheetStatus.Resubmitted)
      )
    );

  // Send notifications
  try {
    const employer = await getEmployerFromJobApplication(jobApplicationId);
    const freelancer = await getFreelancerInfo(freelancerId);

    if (employer && freelancer) {
      // Send notification to employer
      const employerNotification = await createNotification({
        userId: employer.employerUserId,
        type: NotificationType.StatusUpdate,
        title: 'Timesheet Resubmitted',
        message: `${freelancer.userFirstName} ${freelancer.userLastName} has resubmitted their timesheet for the week of ${weekStartYMD} to ${weekEndYMD}. Please review.`,
        payload: {
          timesheetId: existing[0].id,
          freelancerName: `${freelancer.userFirstName} ${freelancer.userLastName}`,
          weekStart: weekStartYMD,
          weekEnd: weekEndYMD,
          totalHours: totalHours,
          type: 'resubmission',
        },
      });
      console.log('🔔 [TIMESHEET RESUBMIT] Employer notification created:', employerNotification);

      // Send confirmation to freelancer
      if (currentUserId) {
        await createNotification({
          userId: currentUserId,
          type: NotificationType.StatusUpdate,
          title: 'Timesheet Resubmitted',
          message: `You have successfully resubmitted your timesheet for the week of ${weekStartYMD} to ${weekEndYMD}.`,
          payload: {
            timesheetId: existing[0].id,
            weekStart: weekStartYMD,
            weekEnd: weekEndYMD,
            totalHours: totalHours,
            type: 'resubmission',
          },
        });
      }
    }
  } catch (error) {
    console.error('Failed to send resubmission notifications:', error);
    // Don't throw - notification failure shouldn't break resubmission
  }

  return {
    submittedDates: getSubmittedDatesForWeek(
      freelancerId,
      jobApplicationId,
      weekStartYMD,
      weekEndYMD
    ),
  };
}

/* ─────────────────── compatibility: submitTimesheetDay ─────────────────── */
export async function submitTimesheetDay(
  freelancerId: number,
  jobApplicationId: number,
  date: Date,
  currentUserId?: number
) {
  const weekStart = startOfWeekMonday(date);
  const weekStartYMD = toYMD(weekStart);
  return submitTimesheetWeek(freelancerId, jobApplicationId, weekStartYMD, currentUserId);
}

/* ─────────────────── getMostRecentSubmittedWeek ─────────────────── */
export async function getMostRecentSubmittedWeek(
  freelancerId: number,
  jobApplicationId: number
): Promise<string | null> {
  try {
    const mostRecentWeek = await db
      .select({
        weekStart: timesheetWeekEntriesTable.weekStart,
      })
      .from(timesheetWeekEntriesTable)
      .where(
        and(
          eq(timesheetWeekEntriesTable.freelancerId, freelancerId),
          eq(timesheetWeekEntriesTable.jobApplicationId, jobApplicationId),
          inArray(timesheetWeekEntriesTable.status, [
            TimesheetStatus.Submitted,
            TimesheetStatus.Approved,
            TimesheetStatus.Rejected,
          ])
        )
      )
      .orderBy(timesheetWeekEntriesTable.weekStart)
      .limit(1);

    return mostRecentWeek[0]?.weekStart || null;
  } catch (error) {
    console.error('Error fetching most recent submitted week:', error);
    return null;
  }
}

/* ─────────────────── checkWeekSubmissions ─────────────────── */
export async function checkWeekSubmissions(
  freelancerId: number,
  jobApplicationId: number,
  weekStart: string
): Promise<boolean> {
  try {
    const weekEnd = addDays(weekStart, 6);

    const submissions = await db
      .select({
        id: timesheetWeekEntriesTable.id,
      })
      .from(timesheetWeekEntriesTable)
      .where(
        and(
          eq(timesheetWeekEntriesTable.freelancerId, freelancerId),
          eq(timesheetWeekEntriesTable.jobApplicationId, jobApplicationId),
          gte(timesheetWeekEntriesTable.weekStart, weekStart),
          lte(timesheetWeekEntriesTable.weekStart, weekEnd),
          inArray(timesheetWeekEntriesTable.status, [
            TimesheetStatus.Submitted,
            TimesheetStatus.Approved,
            TimesheetStatus.Rejected,
          ])
        )
      )
      .limit(1);

    return submissions.length > 0;
  } catch (error) {
    console.error('Error checking week submissions:', error);
    return false;
  }
}

/* ─────────────────── approveTimesheetWeek ─────────────────── */
export async function approveTimesheetWeek(
  weekId: number,
  employerId: number,
  currentUserId: number
) {
  try {
    // Get the week entry to verify ownership and get details
    const weekEntry = await db
      .select({
        id: timesheetWeekEntriesTable.id,
        freelancerId: timesheetWeekEntriesTable.freelancerId,
        jobApplicationId: timesheetWeekEntriesTable.jobApplicationId,
        weekStart: timesheetWeekEntriesTable.weekStart,
        status: timesheetWeekEntriesTable.status,
      })
      .from(timesheetWeekEntriesTable)
      .where(eq(timesheetWeekEntriesTable.id, weekId))
      .limit(1);

    if (!weekEntry[0]) {
      throw new Error('Week entry not found');
    }

    const week = weekEntry[0];

    // Verify the employer owns this job
    const jobOwnership = await db
      .select({
        employerId: jobsTable.employerId,
      })
      .from(jobsTable)
      .innerJoin(jobApplicationsTable, eq(jobsTable.id, jobApplicationsTable.jobId))
      .where(eq(jobApplicationsTable.id, week.jobApplicationId))
      .limit(1);

    if (!jobOwnership[0] || jobOwnership[0].employerId !== employerId) {
      throw new Error('Unauthorized: You can only approve timesheets for your own jobs');
    }

    // Check if week is already approved
    if (week.status === TimesheetStatus.Approved) {
      throw new Error('Week is already approved');
    }

    // Update week entry status to approved
    await db
      .update(timesheetWeekEntriesTable)
      .set({
        status: TimesheetStatus.Approved,
        updatedAt: new Date(),
      } as any)
      .where(eq(timesheetWeekEntriesTable.id, weekId));

    // Update all day entries for this week to approved
    const weekStart = week.weekStart;
    const weekEnd = addDays(weekStart, 6);

    await db
      .update(timesheetDayEntriesTable)
      .set({
        entryStatus: TimesheetStatus.Approved,
        updatedAt: new Date(),
      } as any)
      .where(
        and(
          eq(timesheetDayEntriesTable.freelancerId, week.freelancerId),
          eq(timesheetDayEntriesTable.jobApplicationId, week.jobApplicationId),
          gte(timesheetDayEntriesTable.workDate, weekStart),
          lte(timesheetDayEntriesTable.workDate, weekEnd)
        )
      );

    // Send notifications
    try {
      const employer = await getEmployerFromJobApplication(week.jobApplicationId);
      const freelancer = await getFreelancerInfo(week.freelancerId);

      if (employer && freelancer) {
        // Send notification to freelancer
        // Use the freelancer's actual userId (via account → user)
        const { accountsTable, UsersTable } = await import('@mawaheb/db');
        const { eq } = await import('drizzle-orm');
        const acc = await db
          .select({ userId: UsersTable.id })
          .from(accountsTable)
          .innerJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
          .where(eq(accountsTable.id, (freelancer as any).accountId))
          .limit(1);
        const freelancerUserId = acc[0]?.userId ?? week.freelancerId;
        console.log(
          '[approveTimesheetWeek] notify freelancer userId=',
          freelancerUserId,
          'from accountId=',
          (freelancer as any).accountId
        );
        await createNotification({
          userId: freelancerUserId,
          type: NotificationType.StatusUpdate,
          title: 'Timesheet Approved',
          message: `Your timesheet for the week of ${weekStart} to ${weekEnd} has been approved by ${employer.employerCompanyName || `${employer.userFirstName} ${employer.userLastName}`}.`,
          payload: {
            timesheetId: weekId,
            employerName:
              employer.employerCompanyName || `${employer.userFirstName} ${employer.userLastName}`,
            weekStart,
            weekEnd,
            status: 'approved',
          },
        });

        // Send confirmation notification to employer
        console.log('[approveTimesheetWeek] notify employer userId=', currentUserId);
        await createNotification({
          userId: currentUserId,
          type: NotificationType.StatusUpdate,
          title: 'Timesheet Approval Confirmed',
          message: `You have approved ${freelancer.userFirstName} ${freelancer.userLastName}'s timesheet for the week of ${weekStart} to ${weekEnd}.`,
          payload: {
            timesheetId: weekId,
            freelancerName: `${freelancer.userFirstName} ${freelancer.userLastName}`,
            weekStart,
            weekEnd,
            status: 'approved',
          },
        });
      }
    } catch (error) {
      console.error('Failed to send approval notifications:', error);
      // Don't throw - notification failure shouldn't break approval
    }

    return { success: true, weekId, status: TimesheetStatus.Approved };
  } catch (error) {
    console.error('Error approving timesheet week:', error);
    throw error;
  }
}

/* ─────────────────── reviewTimesheetWeek ─────────────────── */
export async function reviewTimesheetWeek(args: {
  weekId: number;
  employerId: number;
  jobApplicationId: number;
  decisions: Array<{ entryId: number; status: 'accepted' | 'rejected'; note?: string }>;
  currentUserId: number;
}) {
  const { weekId, employerId, jobApplicationId, decisions, currentUserId } = args;
  const { jobsTable, timesheetWeekEntriesTable, timesheetDayEntriesTable } = await import(
    '@mawaheb/db'
  );
  const { eq, and, inArray } = await import('drizzle-orm');
  const { TimesheetStatus, NotificationType } = await import('@mawaheb/db/enums');

  // verify employer owns the job
  const jobOwnership = await db
    .select({ employerId: jobsTable.employerId })
    .from(jobsTable)
    .innerJoin(
      timesheetWeekEntriesTable,
      eq(timesheetWeekEntriesTable.jobApplicationId, jobsTable.id)
    )
    .where(eq(timesheetWeekEntriesTable.id, weekId))
    .limit(1);
  if (!jobOwnership[0] || jobOwnership[0].employerId !== employerId) {
    throw new Error('Unauthorized');
  }

  // set week status → Rejected
  await db
    .update(timesheetWeekEntriesTable)
    .set({ status: TimesheetStatus.Rejected, updatedAt: new Date() } as any)
    .where(eq(timesheetWeekEntriesTable.id, weekId));

  // update day entries
  const acceptedIds: number[] = [];
  const rejectedIds: number[] = [];
  for (const d of decisions) {
    if (!d.entryId || !['accepted', 'rejected'].includes(d.status)) continue;
    const entryUpdate: any = {
      entryStatus: d.status === 'accepted' ? TimesheetStatus.Approved : TimesheetStatus.Rejected,
      updatedAt: new Date(),
    };
    if (d.note != null) entryUpdate.note = d.note;
    console.log(
      '[reviewTimesheetWeek] updating entry',
      d.entryId,
      'status=',
      d.status,
      'note=',
      d.note
    );
    await db
      .update(timesheetDayEntriesTable)
      .set(entryUpdate)
      .where(eq(timesheetDayEntriesTable.id, d.entryId));
    if (d.status === 'accepted') acceptedIds.push(d.entryId);
    else rejectedIds.push(d.entryId);
  }

  // notify freelancer and employer (best-effort)
  try {
    const weekRow = await db
      .select({
        weekStart: timesheetWeekEntriesTable.weekStart,
        weekEnd: timesheetWeekEntriesTable.weekEnd,
        freelancerId: timesheetWeekEntriesTable.freelancerId,
        jobApplicationId: timesheetWeekEntriesTable.jobApplicationId,
      })
      .from(timesheetWeekEntriesTable)
      .where(eq(timesheetWeekEntriesTable.id, weekId))
      .limit(1);
    const week = weekRow[0];
    if (week) {
      // Fetch employer name and job title for richer message
      const employer = await getEmployerFromJobApplication(week.jobApplicationId);
      const { jobsTable, jobApplicationsTable } = await import('@mawaheb/db');
      const jobInfo = await db
        .select({ title: jobsTable.title })
        .from(jobApplicationsTable)
        .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
        .where(eq(jobApplicationsTable.id, week.jobApplicationId))
        .limit(1);
      const employerName =
        employer?.employerCompanyName ||
        `${employer?.userFirstName ?? ''} ${employer?.userLastName ?? ''}`.trim();
      const jobTitle = jobInfo[0]?.title ?? 'your job';

      const freelancerInfo = await getFreelancerInfo(week.freelancerId);

      // Use the freelancer's actual userId (via account → user) - same logic as in approveTimesheetWeek
      const { accountsTable, UsersTable } = await import('@mawaheb/db');
      const acc = await db
        .select({ userId: UsersTable.id })
        .from(accountsTable)
        .innerJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
        .where(eq(accountsTable.id, (freelancerInfo as any).accountId))
        .limit(1);
      const freelancerUserId = acc[0]?.userId ?? week.freelancerId;

      // Log chosen recipient id for debugging
      console.log(
        '[reviewTimesheetWeek] notify freelancer userId=',
        freelancerUserId,
        'from accountId=',
        (freelancerInfo as any).accountId
      );

      await createNotification({
        userId: freelancerUserId,
        type: NotificationType.StatusUpdate,
        title: 'Timesheet Returned for Revision',
        message: `${employerName} reviewed your ${jobTitle} week ${week.weekStart}–${week.weekEnd}: ${acceptedIds.length} approved, ${rejectedIds.length} rejected. Please update the rejected entries and resubmit.`,
        payload: { weekId, jobApplicationId, acceptedIds, rejectedIds },
      });

      // Notify employer (confirmation)
      console.log('[reviewTimesheetWeek] notify employer userId=', currentUserId);
      await createNotification({
        userId: currentUserId,
        type: NotificationType.StatusUpdate,
        title: 'Review sent to freelancer',
        message: `You returned ${jobTitle} week ${week.weekStart}–${week.weekEnd} to the freelancer: ${acceptedIds.length} approved, ${rejectedIds.length} rejected.`,
        payload: { weekId, jobApplicationId, acceptedIds, rejectedIds },
      });
    }
  } catch (e) {
    console.error('Review notify failed', e);
  }

  return { success: true, weekId, accepted: acceptedIds.length, rejected: rejectedIds.length };
}
