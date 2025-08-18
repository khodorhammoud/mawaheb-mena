// ~/servers/timesheet.server.ts
import { and, eq, gte, lte, inArray } from 'drizzle-orm';
import { db } from '@mawaheb/db/server';
import {
  timesheetDayEntriesTable,
  timesheetWeekEntriesTable,
  timesheetWeekDayEntriesTable,
} from '@mawaheb/db';
import { TimesheetStatus } from '@mawaheb/db/enums';
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
  const rows = await db
    .select()
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

  return rows.length > 0;
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

// submit an entire week (idempotent per (freelancer, jobApp, weekStart))
export async function submitTimesheetWeek(
  freelancerId: number,
  jobApplicationId: number,
  weekStartYMD: string
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

  return { week, submittedDates };
}

/* ─────────────────── compatibility: submitTimesheetDay ─────────────────── */
export async function submitTimesheetDay(
  freelancerId: number,
  jobApplicationId: number,
  date: Date
) {
  const weekStart = startOfWeekMonday(date);
  const weekStartYMD = toYMD(weekStart);
  return submitTimesheetWeek(freelancerId, jobApplicationId, weekStartYMD);
}
