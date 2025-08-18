import { useState, useEffect, useMemo } from 'react';
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

type Entry = {
  id: number;
  date: string;
  hours: number;
  description: string;
  startHour?: number;
  startMeridiem?: 'AM' | 'PM';
  endHour?: number;
  endMeridiem?: 'AM' | 'PM';
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
  const { toast } = useToast(); // ✅ always defined

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });
  const todayISO = ymd(new Date());
  const weekEndISO = ymd(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
  const isWeekLocked = useMemo(
    () => weekDays.every(d => lockedSet.has(ymd(d))),
    [weekDays, lockedSet]
  );

  // fetch week data
  useEffect(() => {
    const qs = new URLSearchParams({
      jobAppId: String(jobApplicationId),
      weekStart: ymd(weekStart),
    }).toString();
    weekFetcher.load(`/updated-timesheets?${qs}`);
  }, [jobApplicationId, currentWeek]);

  // consume loader for week
  useEffect(() => {
    if (weekFetcher.data?.mode !== 'timesheet') return;
    setEntriesByDate(groupByDate(weekFetcher.data.entries || []));
    setLockedSet(new Set((weekFetcher.data.submittedDates ?? []).map(d => d)));
  }, [weekFetcher.data]);

  // consume action responses
  useEffect(() => {
    const data = actionFetcher.data;
    if (!data) return;

    if (data.ok && data.type === 'WEEK_SUBMITTED') {
      const submitted = data.submittedDates;
      setLockedSet(prev => {
        const next = new Set(prev);
        submitted.forEach(d => next.add(d));
        return next;
      });
      toast({
        title: 'Week submitted',
        description: `Submitted ${submitted.length} day(s).`,
      });
      return;
    }

    if (data.ok === false && data.error) {
      toast({
        title: 'Error',
        description: String(data.error),
        variant: 'destructive',
      });
    }
  }, [actionFetcher.data, toast]);

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
    setShowSubmitWarning(true);
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
          <Link to="/updated-timesheets">← Back to Jobs</Link>
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
      <div className="flex items-center justify-between bg-white rounded-lg border p-3">
        <Button
          variant="outline"
          onClick={() => handleWeekNavigation('prev')}
          className={cn('gap-2 h-8 text-xs', NO_FOCUS_BTN)}
        >
          ← Previous Week
        </Button>
        <div className="text-center">
          <h3 className="text-base font-semibold">{getCurrentWeekLabel()}</h3>
        </div>
        <Button
          variant="outline"
          onClick={() => handleWeekNavigation('next')}
          className={cn('gap-2 h-8 text-xs', NO_FOCUS_BTN)}
        >
          Next Week →
        </Button>
      </div>

      {isWeekLocked && (
        <div className="rounded-md border bg-green-50 px-3 py-2 text-xs text-green-700">
          ✅ Week submitted to employer — entries are locked.
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

            return (
              <DayCell
                key={dateYMD}
                dateISO={dateYMD}
                jobApplicationId={jobApplicationId}
                locked={isLocked}
                isFuture={isFuture}
                isToday={dateYMD === todayISO}
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
          disabled={actionFetcher.state === 'submitting' || isWeekLocked || weekEndISO > todayISO}
          onClick={handleSubmitWeek}
        >
          {isWeekLocked
            ? 'Week Submitted'
            : weekEndISO > todayISO
              ? 'Week Not Finished'
              : actionFetcher.state === 'submitting'
                ? 'Submitting…'
                : 'Submit Week'}
        </Button>
      </div>

      <Dialog open={showSubmitWarning} onOpenChange={setShowSubmitWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit this week?</DialogTitle>
            <DialogDescription>
              Submitting will lock all entries in this week. You won’t be able to add or edit hours
              until the employer reviews them.
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
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
