/**
 * EnhancedTimesheet Component (Freelancer View)
 *
 * PURPOSE:
 * - Main timesheet interface for freelancers
 * - Allows creation, editing, and submission of timesheet entries
 * - Handles week-based navigation and submission workflow
 *
 * KEY FEATURES:
 * - Week navigation with bell notifications for new decisions
 * - Day-by-day entry creation and editing
 * - Week submission with validation
 * - Resubmission workflow for rejected weeks
 * - Real-time status updates and locking
 *
 * WORKFLOW:
 * 1. Freelancer creates entries for each day
 * 2. Entries can be edited until week is submitted
 * 3. Week submission locks all entries
 * 4. If week is rejected, freelancer can fix rejected entries
 * 5. Resubmission changes status back to 'submitted'
 *
 * STATUS HANDLING:
 * - 'draft': Entries can be created/edite
 * - 'submitted': Entries are locked, waiting for employer review
 * - 'approved': Entries are permanently locked
 * - 'rejected': Only rejected entries can be fixed
 * - 'resubmitted': Fixed entries ready for resubmission
 *
 * USED BY:
 * - Freelancers to manage their timesheet entries
 * - Main timesheet route for freelancer view
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useFetcher, Link } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import DayCell from './DayCell';
import { useToast } from '~/components/hooks/use-toast';
import { startOfWeek, addWeeks, format } from 'date-fns';
import { NO_FOCUS_BTN } from '~/lib/tw';
import { cn } from '~/lib/utils';
import { useNotifications } from '~/context/NotificationContext';
import { AlertTriangle, CheckCircle, Lock } from 'lucide-react';

type Entry = {
  id: number;
  date: string;
  hours: number;
  description: string;
  startHour?: number;
  startMeridiem?: 'AM' | 'PM';
  endHour?: number;
  endMeridiem?: 'AM' | 'PM';
  entryStatus?: string;
};

// helpers to sort by start time (earliest first)
const to24 = (h12: number, m: 'AM' | 'PM') => (h12 % 12) + (m === 'PM' ? 12 : 0);
const startValue = (e: Entry): number => {
  if (e.startHour == null || !e.startMeridiem) return 99; // push unknowns to end
  return to24(e.startHour, e.startMeridiem);
};
const sortByStart = (arr: Entry[]) => arr.sort((a, b) => startValue(a) - startValue(b));

function groupByDate(list: Entry[]): Record<string, Entry[]> {
  const grouped = list.reduce<Record<string, Entry[]>>((acc, e) => {
    const k = e.date;
    (acc[k] ||= []).push(e);
    return acc;
  }, {});
  // sort each day by start time asc
  for (const k of Object.keys(grouped)) sortByStart(grouped[k]);
  return grouped;
}

type Props = {
  jobApplicationId: number;
  jobTitle: string;
  employerName: string;
  projectId: string;
  initialEntries: Entry[];
  submittedDates?: string[];
};

type ActionFetcherData =
  | { ok: true; type: 'WEEK_SUBMITTED'; submittedDates: string[] }
  | { ok: false; error: string }
  | undefined;

type WeekLoaderPayload = {
  mode: 'timesheet';
  jobApplicationId: number;
  jobTitle: string;
  employerName: string;
  projectId: string;
  entries: Entry[];
  submittedDates: string[];
  weekStatus?: string | null;
  weekId?: number | null;
};

const ymd = (d: Date) => format(d, 'yyyy-MM-dd');

export default function EnhancedTimesheet({
  jobApplicationId,
  jobTitle,
  employerName,
  projectId,
  initialEntries,
  submittedDates,
}: Props) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [entriesByDate, setEntriesByDate] = useState<Record<string, Entry[]>>(() =>
    groupByDate(initialEntries || [])
  );
  const [lockedSet, setLockedSet] = useState<Set<string>>(
    () => new Set((submittedDates ?? []).map(d => d))
  );
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  const actionFetcher = useFetcher<ActionFetcherData>();
  const weekFetcher = useFetcher<WeekLoaderPayload>();
  const prevWeekFetcher = useFetcher<WeekLoaderPayload>();
  const nextWeekFetcher = useFetcher<WeekLoaderPayload>();
  const { toast } = useToast(); // ✅ always defined
  const { refreshNotifications } = useNotifications(); // Add notification refresh capability
  const hasShownSubmitToastRef = useRef(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const prevWeekStart = startOfWeek(addWeeks(currentWeek, -1), { weekStartsOn: 1 });
  const nextWeekStart = startOfWeek(addWeeks(currentWeek, 1), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });
  const todayISO = ymd(new Date());
  const weekEndISO = ymd(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));

  // fetch week data
  useEffect(() => {
    const qs = new URLSearchParams({
      jobAppId: String(jobApplicationId),
      weekStart: ymd(weekStart),
    }).toString();
    weekFetcher.load(`/timesheets?${qs}`);
  }, [jobApplicationId, currentWeek]);

  // Preload previous/next week status for bell indicators
  useEffect(() => {
    const prevQs = new URLSearchParams({
      jobAppId: String(jobApplicationId),
      weekStart: ymd(prevWeekStart),
    }).toString();
    const nextQs = new URLSearchParams({
      jobAppId: String(jobApplicationId),
      weekStart: ymd(nextWeekStart),
    }).toString();
    prevWeekFetcher.load(`/timesheets?${prevQs}`);
    nextWeekFetcher.load(`/timesheets?${nextQs}`);
  }, [jobApplicationId, prevWeekStart, nextWeekStart]);

  // consume loader for week
  useEffect(() => {
    if (weekFetcher.data?.mode !== 'timesheet') return;
    setEntriesByDate(groupByDate(weekFetcher.data.entries || []));
    setLockedSet(new Set((weekFetcher.data.submittedDates ?? []).map(d => d)));
  }, [weekFetcher.data]);

  // Banner and permissions: when week is rejected, allow edits only on rejected entries
  const isWeekRejected = weekFetcher.data?.weekStatus === 'rejected';
  const isWeekApproved = weekFetcher.data?.weekStatus === 'approved';

  const isWeekLocked = useMemo(() => {
    // If the week is rejected, it's only locked if there are no rejected entries left to fix
    if (isWeekRejected) {
      const rejectedEntries =
        weekFetcher.data?.entries?.filter(e => e.entryStatus === 'rejected') || [];
      return rejectedEntries.length === 0;
    }
    // If the week is submitted or approved, it should be locked
    if (
      weekFetcher.data?.weekStatus === 'submitted' ||
      weekFetcher.data?.weekStatus === 'approved'
    ) {
      return true;
    }
    // Otherwise, use the original logic
    return weekDays.every(d => lockedSet.has(ymd(d)));
  }, [
    weekDays,
    lockedSet,
    isWeekRejected,
    weekFetcher.data?.entries,
    weekFetcher.data?.weekStatus,
  ]);

  // consume action responses
  useEffect(() => {
    const data = actionFetcher.data;
    if (!data) return;

    if (data.ok && data.type === 'WEEK_SUBMITTED') {
      if (hasShownSubmitToastRef.current) return; // prevent duplicate toasts
      const submitted = data.submittedDates;
      setLockedSet(prev => {
        const next = new Set(prev);
        if (Array.isArray(submitted)) {
          submitted.forEach(d => next.add(d));
        }
        return next;
      });
      toast({
        title: 'Week submitted',
        description: `Submitted ${submitted.length} day(s).`,
      });

      // Refresh notifications to show the new timesheet submission notifications
      refreshNotifications();

      hasShownSubmitToastRef.current = true;

      return;
    }

    if (data.ok === false && data.error) {
      toast({
        title: 'Error',
        description: String(data.error),
        variant: 'destructive',
      });
    }
  }, [actionFetcher.data, toast, refreshNotifications]);

  // reset toast guard when a new submission starts
  useEffect(() => {
    if (actionFetcher.state === 'submitting') {
      hasShownSubmitToastRef.current = false;
    }
  }, [actionFetcher.state]);

  const handleSubmitWeek = () => {
    // Only allow when the week has ended (today >= last day of the week)
    if (weekEndISO > todayISO) {
      toast({
        title: 'Week not finished',
        description: `You can submit this week after ${format(new Date(weekEndISO), 'EEE, MMM dd')}.`,
        variant: 'destructive',
      });
      return;
    }

    // Check if it's a resubmission (when week is rejected and all rejected entries are fixed)
    if (isWeekRejected && isWeekLocked) {
      // This is a resubmission
      setShowSubmitWarning(true);
    } else {
      // Regular submission
      setShowSubmitWarning(true);
    }
  };

  const confirmSubmitWeek = () => {
    setShowSubmitWarning(false);
    actionFetcher.submit(
      {
        intent: 'SUBMIT_WEEK',
        jobApplicationId: String(jobApplicationId),
        weekStart: ymd(weekStart),
      },
      { method: 'post' }
    );
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
  };

  const getCurrentWeekLabel = () => {
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    return `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`;
  };

  const totalWeekHours = useMemo(() => {
    let s = 0;
    for (const arr of Object.values(entriesByDate)) {
      for (const e of arr) s += Number(e?.hours ?? 0);
    }
    return s;
  }, [entriesByDate]);

  const upsertEntry = (e: Entry) => {
    setEntriesByDate(prev => {
      const arr = prev[e.date] ? [...prev[e.date]] : [];
      const idx = arr.findIndex(x => x.id === e.id);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...e };
      else arr.push(e);
      sortByStart(arr);
      return { ...prev, [e.date]: arr };
    });
  };

  return (
    <div className="space-y-3">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" className={cn('gap-2 h-8 text-xs', NO_FOCUS_BTN)}>
          <Link to="/timesheets">← Back to Jobs</Link>
        </Button>
        <div className="text-xs text-gray-500">{format(new Date(), 'EEE, MMM dd, yyyy')}</div>
      </div>
      {/* Job header */}
      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold leading-tight mb-1">{jobTitle}</h2>
            <p className="text-xs text-gray-600">
              {employerName} • {projectId}
            </p>
          </div>
          <div className="text-right">
            <div className="text-base font-semibold">{totalWeekHours.toFixed(2)}h</div>
            <div className="text-xs text-gray-500">This Week</div>
          </div>
        </div>
      </div>
      {/* Week nav */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handleWeekNavigation('prev')}
            className={cn(
              'gap-2 h-8 px-4 shadow-sm hover:shadow-md transition-all font-medium text-sm',
              NO_FOCUS_BTN
            )}
          >
            ← Previous Week
          </Button>
          <div className="text-center relative">
            <h3 className="text-base font-semibold">{getCurrentWeekLabel()}</h3>
          </div>
          <Button
            variant="outline"
            onClick={() => handleWeekNavigation('next')}
            className={cn(
              'gap-2 h-8 px-4 shadow-sm hover:shadow-md transition-all font-medium text-sm',
              NO_FOCUS_BTN
            )}
          >
            Next Week →
          </Button>
        </div>
      </div>
      {!isWeekApproved && !isWeekRejected && isWeekLocked && (
        <div className="flex items-center gap-2 rounded-md border bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <Lock className="h-4 w-4 text-blue-600" />
          <span>Week submitted to {employerName} — entries are locked.</span>
        </div>
      )}
      {/* Approved / Rejected banners */}
      {isWeekApproved && (
        <div className="flex items-center gap-2 rounded-md border bg-green-50 px-3 py-2 text-xs text-green-700">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Week approved by {employerName} — entries are locked.</span>
        </div>
      )}
      {isWeekRejected && (
        <div className="flex items-center gap-2 rounded-md border bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span>
            Week rejected by {employerName}. Fix the rejected entries and resubmit. Approved entries
            are locked.
          </span>
        </div>
      )}
      {/* Grid */}
      <div className="bg-white">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(date => {
            const dateYMD = ymd(date);
            const list = entriesByDate[dateYMD] ?? [];
            const isLocked = lockedSet.has(dateYMD);
            const isFuture = dateYMD > todayISO;

            // When week is rejected: unlock days that have rejected OR resubmitted entries
            const hasRejected = list.some((e: any) => e.entryStatus === 'rejected');
            const hasResubmitted = list.some((e: any) => e.entryStatus === 'resubmitted');
            const hasEditableEntries = hasRejected || hasResubmitted;
            const note = (list.find((e: any) => e.entryStatus === 'rejected') as any)?.note || '';

            // Debug: verify reviewer note per day
            // try {
            //   console.log('[EnhancedTimesheet] day note check', {
            //     dateYMD,
            //     isWeekRejected,
            //     hasRejected,
            //     note,
            //     entries: list.map((e: any) => ({ id: e.id, status: e.entryStatus, note: e.note })),
            //   });
            // } catch {}

            return (
              <DayCell
                key={dateYMD}
                dateISO={dateYMD}
                jobApplicationId={jobApplicationId}
                locked={isWeekRejected ? !hasEditableEntries : isLocked}
                isFuture={isFuture}
                isToday={dateYMD === todayISO}
                reviewerNote={isWeekRejected ? note : ''}
                weekRejected={isWeekRejected}
                entries={list}
                onSaved={saved =>
                  upsertEntry({
                    id: saved.id,
                    date: saved.date,
                    hours: Number(saved.hours ?? 0),
                    description: saved.description ?? '',
                    startHour: saved.startHour,
                    startMeridiem: saved.startMeridiem,
                    endHour: saved.endHour,
                    endMeridiem: saved.endMeridiem,
                  })
                }
              />
            );
          })}
        </div>
      </div>
      {/* Submit week */}
      <div className="flex justify-center">
        <Button
          className={cn('px-4 text-xs h-8 bg-primaryColor hover:bg-primaryColor/80', NO_FOCUS_BTN)}
          disabled={
            actionFetcher.state === 'submitting' ||
            weekEndISO > todayISO ||
            (isWeekRejected && !isWeekLocked) || // Disable resubmit if there are still rejected entries
            weekFetcher.data?.weekStatus === 'submitted' || // Disable if week is already submitted
            weekFetcher.data?.weekStatus === 'approved' // Disable if week is already approved
          }
          onClick={handleSubmitWeek}
        >
          {weekEndISO > todayISO
            ? 'Week Not Finished'
            : actionFetcher.state === 'submitting'
              ? 'Submitting…'
              : isWeekRejected
                ? isWeekLocked
                  ? 'Resubmit Week'
                  : 'Fix Rejected Entries'
                : weekFetcher.data?.weekStatus === 'submitted' ||
                    weekFetcher.data?.weekStatus === 'approved'
                  ? 'Week Submitted'
                  : 'Submit Week'}
        </Button>
      </div>
      <Dialog open={showSubmitWarning} onOpenChange={setShowSubmitWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isWeekRejected && isWeekLocked ? 'Resubmit this week?' : 'Submit this week?'}
            </DialogTitle>
            <DialogDescription>
              {isWeekRejected && isWeekLocked
                ? 'Resubmitting will change all fixed entries back to submitted status and send them for review again. Approved entries will remain approved.'
                : "Submitting will lock all entries in this week. You won't be able to add or edit hours until the employer reviews them."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitWarning(false)}
              className={NO_FOCUS_BTN}
            >
              Cancel
            </Button>
            <Button onClick={confirmSubmitWeek} className={NO_FOCUS_BTN}>
              {isWeekRejected && isWeekLocked ? 'Resubmit' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
