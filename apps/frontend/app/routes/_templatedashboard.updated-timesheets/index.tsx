// app/routes/updated-timesheets.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import EnhancedTimesheet from './components/EnhancedTimesheet';
import SkillBadgeList from '~/common/skill/SkillBadge';

// server helpers (v2)
import {
  insetTimesheetEntryIntoDatabase,
  updateTimesheetEntryInDatabase,
  getTimesheetEntriesForWeek,
  getSubmittedDatesForWeek,
  submitTimesheetWeek,
  isDateSubmitted,
} from '~/servers/timesheet.server';

// DB + enums
import { db } from '@mawaheb/db/server';
import { jobsTable, jobApplicationsTable, employersTable } from '@mawaheb/db';
import { eq } from 'drizzle-orm';
import { getActiveJobsForFreelancer } from '~/servers/job.server';
import { getCurrentFreelancerId } from '~/servers/user.server';

/** Types returned by the loader */
type LoaderData =
  | {
      mode: 'list';
      freelancerId: number | null;
      jobs: Array<{
        jobAppId: number;
        jobId: number;
        title: string | null;
        description: string | null;
        employerName: string | null;
        status: string;
      }>;
    }
  | {
      mode: 'timesheet';
      jobApplicationId: number;
      jobTitle: string;
      employerName: string;
      projectId: string;
      entries: Array<{
        id: number;
        date: string;
        hours: number;
        description: string;
        startHour?: number;
        startMeridiem?: 'AM' | 'PM';
        endHour?: number;
        endMeridiem?: 'AM' | 'PM';
        entryStatus?: string;
      }>;
      submittedDates: string[];
    };

/* ───────────────────────────── helpers ───────────────────────────── */
function toYMD(d: Date | string): string {
  const x = typeof d === 'string' ? new Date(d) : d;
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const da = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function startOfWeekMonday(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay(); // Sun=0..Sat=6
  const diff = day === 0 ? -6 : 1 - day; // Monday
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeekFrom(start: Date) {
  const e = new Date(start);
  e.setDate(start.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

function parseWeekStartParam(weekStartParam: string | null): Date {
  if (!weekStartParam) return startOfWeekMonday(new Date());
  const parts = weekStartParam.split('-').map(Number);
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (!isNaN(d.getTime())) return d;
  }
  return startOfWeekMonday(new Date());
}

/** Convert a JS Date → hour + meridiem (1–12, AM/PM) */
function toHourMeridiem(dt: Date): { hour: number; meridiem: 'AM' | 'PM' } {
  const h24 = dt.getHours();
  const meridiem: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const hour = ((h24 + 11) % 12) + 1; // 0→12, 13→1
  return { hour, meridiem };
}

/** 24h calculator from hour+meridiem */
function to24(h12: number, m: 'AM' | 'PM') {
  return (h12 % 12) + (m === 'PM' ? 12 : 0);
}

/* ───────────────────────────── LOADER ───────────────────────────── */
export async function loader({ request }: LoaderFunctionArgs) {
  const freelancerId = await getCurrentFreelancerId(request);
  if (!freelancerId) {
    throw new Response('Access denied. Only freelancers can access timesheets.', { status: 403 });
  }

  const url = new URL(request.url);
  const jobApplicationId = Number(url.searchParams.get('jobAppId') || 0) || null;

  if (jobApplicationId) {
    // job details
    const jobDetails = await db
      .select({
        title: jobsTable.title,
        description: jobsTable.description,
        employerName: employersTable.companyName,
        freelancerId: jobApplicationsTable.freelancerId,
      })
      .from(jobApplicationsTable)
      .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
      .innerJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
      .where(eq(jobApplicationsTable.id, jobApplicationId))
      .limit(1);

    if (!jobDetails[0] || jobDetails[0].freelancerId !== freelancerId) {
      throw new Response('Not found', { status: 404 });
    }

    const job = jobDetails[0];

    const weekStartParam = url.searchParams.get('weekStart');
    const weekStart = startOfWeekMonday(parseWeekStartParam(weekStartParam));
    const weekEnd = endOfWeekFrom(weekStart);

    const rows = await getTimesheetEntriesForWeek(
      freelancerId,
      jobApplicationId,
      weekStart,
      weekEnd
    );

    // Robust mapping: supports startAt/endAt or discrete hour+meridiem, and ensures numeric hours
    const entries = rows.map((row: any) => {
      const startAtRaw = row.startAt ?? row.start_at ?? null;
      const endAtRaw = row.endAt ?? row.end_at ?? null;

      const startAt = startAtRaw ? new Date(startAtRaw) : null;
      const endAt = endAtRaw ? new Date(endAtRaw) : null;

      let startHour = row.startHour ?? row.start_hour;
      let startMeridiem = (row.startMeridiem ?? row.start_meridiem) as 'AM' | 'PM' | undefined;
      let endHour = row.endHour ?? row.end_hour;
      let endMeridiem = (row.endMeridiem ?? row.end_meridiem) as 'AM' | 'PM' | undefined;

      if ((startHour == null || startMeridiem == null) && startAt) {
        const t = toHourMeridiem(startAt);
        startHour = t.hour;
        startMeridiem = t.meridiem;
      }
      if ((endHour == null || endMeridiem == null) && endAt) {
        const t = toHourMeridiem(endAt);
        endHour = t.hour;
        endMeridiem = t.meridiem;
      }

      let hours: number | null = row.hours as number | null;
      if (!Number.isFinite(hours as number)) {
        if (startAt && endAt) {
          const ms = endAt.getTime() - startAt.getTime();
          const h = ms / 3_600_000;
          hours = Number.isFinite(h) ? h : 0;
        } else if (
          startHour != null &&
          endHour != null &&
          (startMeridiem === 'AM' || startMeridiem === 'PM') &&
          (endMeridiem === 'AM' || endMeridiem === 'PM')
        ) {
          const s24 = to24(Number(startHour), startMeridiem);
          const e24 = to24(Number(endHour), endMeridiem);
          hours = e24 > s24 ? e24 - s24 : 0;
        } else {
          hours = 0;
        }
      }

      return {
        id: row.id,
        date: toYMD(row.date ?? startAt ?? new Date()),
        description: row.description ?? '',
        hours: Number(hours ?? 0),
        startHour: startHour ?? undefined,
        startMeridiem: (startMeridiem as any) ?? undefined,
        endHour: endHour ?? undefined,
        endMeridiem: (endMeridiem as any) ?? undefined,
        entryStatus: (row as any).entryStatus,
      };
    });

    const submittedDates = await getSubmittedDatesForWeek(
      freelancerId,
      jobApplicationId,
      toYMD(weekStart),
      toYMD(weekEnd)
    );

    return json<LoaderData>({
      mode: 'timesheet',
      jobApplicationId,
      jobTitle: job.title || 'Untitled Job',
      employerName: job.employerName || 'Unknown Employer',
      projectId: `PROJ-${jobApplicationId}`,
      entries,
      submittedDates,
    });
  }

  // list of jobs
  const rows = await getActiveJobsForFreelancer(freelancerId);

  return json<LoaderData>({
    mode: 'list',
    freelancerId,
    jobs: rows.map(r => ({
      jobAppId: r.jobAppId,
      jobId: r.jobId,
      title: r.title,
      description: r.description,
      employerName: r.employerName,
      status: r.status,
      budget: (r as any).budget,
      experienceLevel: (r as any).experienceLevel,
      skills: (r as any).skills as { label: string; isStarred: boolean }[] | undefined,
    })),
  });
}

/* ───────────────────────────── ACTION ───────────────── */
export async function action({ request }: ActionFunctionArgs) {
  const currentFreelancerId = await getCurrentFreelancerId(request);
  if (!currentFreelancerId) {
    return json(
      { ok: false, error: 'Access denied. Only freelancers can create timesheet entries.' },
      { status: 403 }
    );
  }

  const form = await request.formData();
  const intent = String(form.get('intent') || '');

  // ---------- CREATE / UPDATE using AM/PM ----------
  if (intent === 'CREATE_ENTRY' || intent === 'UPDATE_ENTRY') {
    const jobApplicationId = Number(form.get('jobApplicationId'));
    const dateISO = String(form.get('date')); // 'YYYY-MM-DD'
    const description = String(form.get('description') || '');

    const startHour = Number(form.get('startHour'));
    const startMeridiem = String(form.get('startMeridiem')) as 'AM' | 'PM';
    const endHour = Number(form.get('endHour'));
    const endMeridiem = String(form.get('endMeridiem')) as 'AM' | 'PM';

    if (!currentFreelancerId || !jobApplicationId || !dateISO) {
      return json({ ok: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const todayYMD = toYMD(new Date());
    if (dateISO > todayYMD) {
      return json({ ok: false, error: 'You cannot add or edit future days.' }, { status: 400 });
    }

    const locked = await isDateSubmitted(currentFreelancerId, jobApplicationId, dateISO);
    if (locked) {
      return json(
        { ok: false, error: 'This day is already submitted and cannot be edited.' },
        { status: 400 }
      );
    }

    // CREATE
    if (intent === 'CREATE_ENTRY') {
      const row = await insetTimesheetEntryIntoDatabase(
        {
          date: dateISO,
          startHour,
          startMeridiem,
          endHour,
          endMeridiem,
          description,
        },
        currentFreelancerId,
        jobApplicationId
      );

      const ms = new Date(row.endAt as any).getTime() - new Date(row.startAt as any).getTime();
      const hours = Number.isFinite(ms) ? ms / 3_600_000 : 0;

      return json({
        ok: true,
        entry: {
          id: row.id,
          date: dateISO,
          hours,
          description,
          startHour,
          startMeridiem,
          endHour,
          endMeridiem,
          entryStatus: (row as any).entryStatus,
        },
      });
    }

    // UPDATE
    const entryId = Number(form.get('entryId'));
    if (!entryId) {
      return json({ ok: false, error: 'Missing entryId for UPDATE_ENTRY.' }, { status: 400 });
    }

    const updated = await updateTimesheetEntryInDatabase(
      {
        id: entryId,
        date: dateISO,
        startHour,
        startMeridiem,
        endHour,
        endMeridiem,
        description,
      } as any,
      currentFreelancerId,
      jobApplicationId
    );

    const ms =
      new Date(updated.endAt as any).getTime() - new Date(updated.startAt as any).getTime();
    const hours = Number.isFinite(ms) ? ms / 3_600_000 : 0;

    return json({
      ok: true,
      entry: {
        id: entryId,
        date: dateISO,
        hours,
        description,
        startHour,
        startMeridiem,
        endHour,
        endMeridiem,
        entryStatus: (updated as any).entryStatus,
      },
    });
  }

  // ---------- SUBMIT WEEK ----------
  if (intent === 'SUBMIT_WEEK') {
    const jobApplicationId = Number(form.get('jobApplicationId'));
    const weekStartYMD = String(form.get('weekStart')); // 'YYYY-MM-DD'

    if (!jobApplicationId || !weekStartYMD) {
      return json({ ok: false, error: 'Missing jobApplicationId or weekStart.' }, { status: 400 });
    }

    try {
      const { submittedDates } = await submitTimesheetWeek(
        currentFreelancerId,
        jobApplicationId,
        weekStartYMD
      );

      return json({ ok: true, type: 'WEEK_SUBMITTED', submittedDates });
    } catch (e: any) {
      return json({ ok: false, error: e?.message || 'Failed to submit week.' }, { status: 400 });
    }
  }

  return json({ ok: false, error: 'Unknown intent' }, { status: 400 });
}

/* ───────────────────────────── PAGE ─────────────────────────────── */
export default function UpdatedTimesheetsPage() {
  const data = useLoaderData<typeof loader>();

  if (data.mode === 'timesheet') {
    return (
      <div className="space-y-6 p-4">
        <EnhancedTimesheet
          jobApplicationId={data.jobApplicationId}
          jobTitle={data.jobTitle}
          employerName={data.employerName}
          projectId={data.projectId}
          initialEntries={data.entries}
          submittedDates={data.submittedDates}
        />
      </div>
    );
  }

  const { jobs } = data;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Active jobs</h2>

      {jobs.length === 0 ? (
        <div className="text-sm text-gray-600">No active jobs for this freelancer.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(j => (
            <div className="lg:grid xl:p-6 p-4 bg-white border rounded-xl shadow-xl gap-4 mb-10">
              <div className="">
                <div className="text-xl lg:text-lg">{j.title ?? 'Untitled job'}</div>
                <div className="text-sm lg:text-xs text-gray-500">{j.employerName}</div>
                <div className="flex xl:gap-10 lg:gap-8 gap-6 mt-4">
                  <div>
                    <p className="text-base lg:text-sm leading-tight">${(j as any).budget ?? 0}</p>
                    <p className="text-gray-400 text-xs">Fixed price</p>
                  </div>
                  <div>
                    <p className="text-base lg:text-sm leading-tight">
                      {(j as any).experienceLevel ?? 'N/A'}
                    </p>
                    <p className="text-gray-400 text-xs">Experience level</p>
                  </div>
                </div>
                <p className="text-sm lg:text-xs text-gray-600 mt-4 line-clamp-3">
                  {j.description}
                </p>
                {(j as any).skills && (j as any).skills.length > 0 && (
                  <div className="lg:mt-8 mt-4 xl:text-base text-sm">
                    <SkillBadgeList
                      skills={
                        Array.isArray((j as any).skills)
                          ? (j as any).skills.slice(0, 6).map(s => ({
                              name: (s as any).label,
                              isStarred: Boolean((s as any).isStarred),
                            }))
                          : []
                      }
                    />
                  </div>
                )}
                <div className="mt-6">
                  <Link
                    className="text-xs border border-gray-300 text-primaryColor bg-white rounded-[10px] py-2 px-3 gradient-box not-active-gradient w-fit whitespace-nowrap hover:text-white hover:bg-primaryColor not-active-gradient mt-4"
                    to={`/updated-timesheets?jobAppId=${j.jobAppId}`}
                  >
                    Open timesheet →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
