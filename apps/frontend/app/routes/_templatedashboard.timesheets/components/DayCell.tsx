/**
 * DayCell Component
 *
 * PURPOSE:
 * - Individual day cell component for timesheet entries
 * - Handles entry creation, editing, and display for a single day
 * - Used by both freelancer and employer views
 *
 * KEY FEATURES:
 * - Entry creation with time input (AM/PM format)
 * - Entry editing and validation
 * - Status display (Approved, Rejected, Fixed, etc.)
 * - Note display for rejected entries
 * - Locking behavior based on week status
 *
 * WORKFLOW:
 * 1. Shows existing entries for the day
 * 2. Allows adding new entries (if not locked)
 * 3. Allows editing existing entries (if not locked)
 * 4. Displays entry status and notes
 * 5. Handles time validation and overlap detection
 *
 * STATUS DISPLAY:
 * - 'approved': Shows green checkmark and "Approved"
 * - 'rejected': Shows red X and "Rejected" with note
 * - 'resubmitted': Shows "Fixed" button
 * - 'submitted': Shows "Edit" button
 *
 * LOCKING LOGIC:
 * - Locked when week is submitted/approved
 * - Unlocked for rejected entries when week is rejected
 * - Unlocked for resubmitted entries
 *
 * USED BY:
 * - EnhancedTimesheet component (freelancer view)
 * - EmployerTimesheet component (employer view)
 * - Provides consistent entry management across both views
 */

// app/routes/components/DayCell.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'; // ✅ added React for memo
import { useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';
import { useToast } from '~/components/hooks/use-toast';
import { NO_FOCUS_BTN } from '~/lib/tw';
import { cn } from '~/lib/utils';
import { CalendarDays, Clock, Lock, CheckCircle, X } from 'lucide-react';

type Meridiem = 'AM' | 'PM';

export type DayCellProps = {
  dateISO: string;
  dateLabel?: string;
  jobApplicationId: number | null;
  locked?: boolean;
  reviewerNote?: string;
  weekRejected?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
  entries?:
    | {
        id: number;
        hours: number;
        description?: string | null;
        startHour?: number;
        startMeridiem?: Meridiem;
        endHour?: number;
        endMeridiem?: Meridiem;
      }[]
    | null;
  onSaved?: (
    entry: { id: number; date: string; hours: number; description?: string } & {
      startHour?: number;
      startMeridiem?: Meridiem;
      endHour?: number;
      endMeridiem?: Meridiem;
    }
  ) => void;
  maxHours?: number;
};

const MAX_HOURS_DEFAULT = 8;
const to24 = (h12: number, m: Meridiem) => (h12 % 12) + (m === 'PM' ? 12 : 0);
const onlyDigits = (s: string) => s.replace(/[^\d]/g, '').slice(0, 2);
const todayYMD = () => new Date().toISOString().slice(0, 10);
const HOUR_TYPO_RE = /^([1-9]|1[0-2])?$/;
const HOUR_FINAL_RE = /^([1-9]|1[0-2])$/;

function DayCellComponent({
  dateISO,
  dateLabel,
  jobApplicationId,
  locked = false,
  reviewerNote = '',
  weekRejected = false,
  isFuture: isFutureProp = false,
  isToday = false,
  entries = [],
  onSaved,
  maxHours = MAX_HOURS_DEFAULT,
}: DayCellProps) {
  const fetcher = useFetcher<{ ok: boolean; entry?: any; error?: string }>();
  const { toast } = useToast();
  const prevState = useRef(fetcher.state);

  const label = useMemo(() => {
    if (dateLabel) return dateLabel;
    const d = new Date(dateISO + 'T00:00:00');
    const w = d.toLocaleDateString(undefined, { weekday: 'short' });
    const day = d.toLocaleDateString(undefined, { day: '2-digit' });
    const mon = d.toLocaleDateString(undefined, { month: 'short' });
    return `${w}\n${day}\n${mon}`;
  }, [dateLabel, dateISO]);

  const isFuture = isFutureProp || dateISO > todayYMD();
  const canCreate = !!jobApplicationId && !locked && !isFuture;
  const canEdit = canCreate; // employers lock logic handled by parent; here freelancer: locked=false means editable (e.g., rejected)

  const list = entries ?? [];
  const totalHours = list.reduce((t, e) => t + Number(e?.hours ?? 0), 0);

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [startHourStr, setStartHourStr] = useState('8');
  const [startMeridiem, setStartMeridiem] = useState<Meridiem>('AM');
  const [endHourStr, setEndHourStr] = useState('2');
  const [endMeridiem, setEndMeridiem] = useState<Meridiem>('PM');
  const [description, setDescription] = useState('');
  const hasInitializedNewRef = useRef(false);

  useEffect(() => {
    if (editingId && editingId !== 'new') {
      // Initialize fields from selected entry once when opening edit
      hasInitializedNewRef.current = false;
      const e = list.find(x => x.id === editingId);
      if (e) {
        setStartHourStr(String(e.startHour ?? 8));
        setStartMeridiem(e.startMeridiem ?? 'AM');
        setEndHourStr(String(e.endHour ?? 2));
        setEndMeridiem(e.endMeridiem ?? 'PM');
        setDescription(e.description || '');
      }
    } else if (editingId === 'new') {
      // Only initialize defaults once per new-entry session to avoid wiping user input on re-renders
      if (!hasInitializedNewRef.current) {
        const to12 = (h24: number): { hour: number; meridiem: Meridiem } => {
          const mer: Meridiem = h24 >= 12 ? 'PM' : 'AM';
          const hr = ((h24 + 11) % 12) + 1;
          return { hour: hr, meridiem: mer };
        };

        const endHours24 = list
          .map(x =>
            x.endHour != null && (x.endMeridiem === 'AM' || x.endMeridiem === 'PM')
              ? to24(Number(x.endHour), x.endMeridiem)
              : null
          )
          .filter((n): n is number => n != null);

        const defaultStart24 = endHours24.length ? Math.max(...endHours24) : 8; // 8AM
        const start24 = Math.min(defaultStart24, 23); // cap to same day
        const end24 = Math.min(start24 + 6, 23); // +6h, stay same day

        const s12 = to12(start24);
        const e12 = to12(end24);

        setStartHourStr(String(s12.hour));
        setStartMeridiem(s12.meridiem);
        setEndHourStr(String(e12.hour));
        setEndMeridiem(e12.meridiem);
        // Do not clear description here; leave any user input intact
        hasInitializedNewRef.current = true;
      }
    } else {
      hasInitializedNewRef.current = false;
    }
  }, [editingId]);

  const startRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editingId !== null) {
      startRef.current?.focus();
      startRef.current?.select();
    }
  }, [editingId]);

  const lastInvalidToastAt = useRef(0);
  const invalidToast = (which: 'Start' | 'End') => {
    const now = Date.now();
    if (now - lastInvalidToastAt.current < 600) return;
    lastInvalidToastAt.current = now;
    toast({
      title: 'Invalid hour',
      description: `${which} hour must be 1–12.`,
      variant: 'destructive',
    });
  };

  const makeHourChange = (setter: (s: string) => void, which: 'Start' | 'End') => (raw: string) => {
    const next = onlyDigits(raw);
    if (HOUR_TYPO_RE.test(next)) setter(next);
    else invalidToast(which);
  };

  const normalizeStart = () => {
    if (!HOUR_FINAL_RE.test(startHourStr)) setStartHourStr('8');
  };
  const normalizeEnd = () => {
    if (!HOUR_FINAL_RE.test(endHourStr)) setEndHourStr('2');
  };

  const diffHours = (() => {
    if (!HOUR_FINAL_RE.test(startHourStr) || !HOUR_FINAL_RE.test(endHourStr)) return 0;
    const s24 = to24(Number(startHourStr), startMeridiem);
    const e24 = to24(Number(endHourStr), endMeridiem);
    return e24 > s24 ? e24 - s24 : 0;
  })();

  const overlapsExisting = useMemo(() => {
    if (!HOUR_FINAL_RE.test(startHourStr) || !HOUR_FINAL_RE.test(endHourStr)) return false;
    const s24 = to24(Number(startHourStr), startMeridiem);
    const e24 = to24(Number(endHourStr), endMeridiem);
    if (e24 <= s24) return false;
    for (const existing of list) {
      if (editingId !== 'new' && editingId !== null && existing.id === editingId) continue;
      if (
        existing.startHour == null ||
        existing.endHour == null ||
        !existing.startMeridiem ||
        !existing.endMeridiem
      )
        continue;
      const es = to24(Number(existing.startHour), existing.startMeridiem as Meridiem);
      const ee = to24(Number(existing.endHour), existing.endMeridiem as Meridiem);
      if (s24 < ee && es < e24) return true; // intervals intersect
    }
    return false;
  }, [list, startHourStr, endHourStr, startMeridiem, endMeridiem, editingId]);

  const lastHandled = useRef<any>(null);

  // Fire toast immediately when a new response arrives
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    if (lastHandled.current === fetcher.data) return; // dedupe
    lastHandled.current = fetcher.data;

    if (fetcher.data.ok && fetcher.data.entry) {
      onSaved?.({
        id: fetcher.data.entry.id,
        date: dateISO,
        hours: Number(fetcher.data.entry.hours ?? 0),
        description: fetcher.data.entry.description,
        startHour: Number(startHourStr),
        startMeridiem,
        endHour: Number(endHourStr),
        endMeridiem,
      });
      toast({ title: 'Saved', description: `Entry saved for ${dateISO}` });
      setEditingId(null);
    } else if (fetcher.data.ok === false && fetcher.data.error) {
      toast({ title: 'Error', description: String(fetcher.data.error), variant: 'destructive' });
    }
  }, [fetcher.state, fetcher.data]);

  const handleSave = () => {
    if (!canCreate) return;
    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please add a brief description of the work before saving.',
        variant: 'destructive',
      });
      return;
    }
    if (overlapsExisting) {
      toast({
        title: 'Overlapping time',
        description: 'This time range overlaps with another entry for this day.',
        variant: 'destructive',
      });
      return;
    }
    if (!HOUR_FINAL_RE.test(startHourStr) || !HOUR_FINAL_RE.test(endHourStr)) {
      toast({
        title: 'Invalid hour',
        description: 'Start and End must be 1–12.',
        variant: 'destructive',
      });
      return;
    }
    const s = Number(startHourStr);
    const e = Number(endHourStr);
    const s24 = to24(s, startMeridiem);
    const e24 = to24(e, endMeridiem);
    if (e24 <= s24) {
      toast({
        title: 'Invalid time',
        description: 'End must be after start.',
        variant: 'destructive',
      });
      return;
    }
    const diff = e24 - s24;
    if (diff > (maxHours ?? MAX_HOURS_DEFAULT)) {
      toast({
        title: 'Too long',
        description: `Max ${maxHours ?? MAX_HOURS_DEFAULT} hours per entry.`,
        variant: 'destructive',
      });
      return;
    }

    const isUpdate = editingId !== 'new' && editingId !== null;
    const body: Record<string, string> = {
      intent: isUpdate ? 'UPDATE_ENTRY' : 'CREATE_ENTRY',
      date: dateISO,
      jobApplicationId: String(jobApplicationId!),
      startHour: String(s),
      startMeridiem,
      endHour: String(e),
      endMeridiem,
      description: description ?? '',
    };
    if (isUpdate) body.entryId = String(editingId!);

    fetcher.submit(body, { method: 'post', action: '.' });
  };

  const cardBorder = isToday ? 'border-primaryColor/80' : '';

  return (
    <div className={cn('w-full min-w-0 rounded-md border bg-white p-2 shadow-sm', cardBorder)}>
      <Header label={label} compact />

      {/* Show locked message for future days */}
      {isFuture && (
        <div className="mb-2 flex items-center justify-center gap-1 rounded-md border bg-gradient-to-r from-gray-50 to-white p-2 text-center text-[11px] text-gray-600">
          <span className="flex gap-1">
            <Lock className="h-4 w-4 text-gray-500" /> Future day — you can’t add hours yet.
          </span>
        </div>
      )}

      <div className="text-center mb-2">
        <div className="text-base font-semibold text-primaryColor">
          {Number(totalHours).toFixed(2)}h
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
        {list.map(e => {
          const startLabel =
            e.startHour != null && e.startMeridiem ? `${e.startHour} ${e.startMeridiem}` : '—';
          const endLabel =
            e.endHour != null && e.endMeridiem ? `${e.endHour} ${e.endMeridiem}` : '—';
          return (
            <div key={e.id} className="rounded-md border bg-gray-50 p-2 flex flex-col">
              <div className="text-xs flex-1">
                <div className="mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {startLabel} – {endLabel}
                  </span>
                </div>
                <span className="text-gray-500">{Number(e?.hours ?? 0).toFixed(2)}h</span>
                {e.description && (
                  <div className="text-[11px] text-gray-600 mt-1 leading-[14px] whitespace-pre-wrap">
                    {e.description}
                  </div>
                )}
                {(e as any).note && (
                  <div className="border-t mt-1 text-[11px] text-black pt-1">
                    Note: {(e as any).note}
                  </div>
                )}
                {/* Entry status icons */}
                {(e as any).entryStatus === 'approved' && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-[10px] text-green-600 font-medium">Approved</span>
                  </div>
                )}
                {(e as any).entryStatus === 'rejected' && (
                  <div className="flex items-center gap-1 mt-1">
                    <X className="h-3 w-3 text-red-600" />
                    <span className="text-[10px] text-red-600 font-medium">Rejected</span>
                  </div>
                )}
              </div>
              {!locked && canEdit && (e as any).entryStatus !== 'approved' && (
                <Button
                  size="sm"
                  className={cn(
                    'bg-primaryColor hover:bg-primaryColor/90 h-6 text-[10px] mt-2 self-start',
                    NO_FOCUS_BTN
                  )}
                  onClick={() => setEditingId(e.id)}
                >
                  {(e as any).entryStatus === 'resubmitted'
                    ? 'Fixed'
                    : (e as any).entryStatus === 'rejected'
                      ? 'Fix'
                      : 'Update'}
                </Button>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="text-center text-[11px] text-gray-400">No entries yet.</div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className={cn('h-7 text-[11px] flex-1', NO_FOCUS_BTN)}
          onClick={() => {
            setDescription('');
            setEditingId('new');
            hasInitializedNewRef.current = false;
          }}
          disabled={!canCreate}
        >
          Add entry
        </Button>
      </div>

      {editingId !== null && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <TimeInput
              label="Start"
              inputRef={startRef}
              hourStr={startHourStr}
              onHourChange={makeHourChange(setStartHourStr, 'Start')}
              meridiem={startMeridiem}
              setMeridiem={setStartMeridiem}
              onBlur={normalizeStart}
            />
            <TimeInput
              label="End"
              hourStr={endHourStr}
              onHourChange={makeHourChange(setEndHourStr, 'End')}
              meridiem={endMeridiem}
              setMeridiem={setEndMeridiem}
              onBlur={normalizeEnd}
            />
          </div>

          <Textarea
            className={cn('min-h-16 text-[11px] resize-none', NO_FOCUS_BTN)}
            placeholder="What did you work on?"
            maxLength={500}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] ${
                diffHours > (maxHours ?? MAX_HOURS_DEFAULT) ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              {diffHours ? `${diffHours}h` : '—'}
              {diffHours > (maxHours ?? MAX_HOURS_DEFAULT) &&
                ` (max ${maxHours ?? MAX_HOURS_DEFAULT})`}
            </span>
            <span className="text-[10px] text-gray-400">{description.length}/500</span>
          </div>
          {overlapsExisting && (
            <div className="text-[10px] text-red-600">Overlaps an existing entry for this day.</div>
          )}

          <div className="flex gap-1.5">
            <Button
              size="sm"
              className={cn(
                'h-7 text-[10px] flex-1 bg-primaryColor hover:bg-primaryColor/80',
                NO_FOCUS_BTN
              )}
              onClick={handleSave}
              disabled={
                !canCreate ||
                fetcher.state === 'submitting' ||
                !HOUR_FINAL_RE.test(startHourStr) ||
                !HOUR_FINAL_RE.test(endHourStr) ||
                overlapsExisting ||
                !description.trim() ||
                diffHours === 0 ||
                diffHours > (maxHours ?? MAX_HOURS_DEFAULT)
              }
            >
              {fetcher.state === 'submitting' ? 'Saving…' : editingId === 'new' ? 'Save' : 'Update'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={cn('h-7 text-[10px]', NO_FOCUS_BTN)}
              onClick={() => setEditingId(null)}
              disabled={fetcher.state === 'submitting'}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ label, compact }: { label: string; compact?: boolean }) {
  const [line1, line2, line3] = label.split('\n');
  return (
    <div className="mb-2 leading-tight border-b pb-3 ml-1 mt-1 flex items-center gap-2">
      <CalendarDays className="h-4 w-4 text-gray-500" />
      <div>
        <div className="text-[10px] font-medium text-gray-500">{line1}</div>
        <div className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
          {line2}
        </div>
        <div className="text-xs text-gray-500">{line3}</div>
      </div>
    </div>
  );
}

function TimeInput({
  label,
  hourStr,
  onHourChange,
  meridiem,
  setMeridiem,
  inputRef,
  onBlur,
}: {
  label: string;
  hourStr: string;
  onHourChange: (raw: string) => void;
  meridiem: Meridiem;
  setMeridiem: (m: Meridiem) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onBlur?: () => void;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] text-gray-500">{label} :</div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center rounded-md border bg-white shadow-xs w-full justify-between focus-within:outline-none focus-within:ring-0 focus-within:ring-offset-0">
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="h-7 rounded-none border-0 text-xs text-center tabular-nums
                       focus:outline-none focus:ring-0
                       focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={hourStr}
            placeholder="--"
            onChange={e => onHourChange(e.target.value)}
            onBlur={onBlur}
          />
          <div className="h-5 w-px bg-gray-200 border-l" />
          <Select value={meridiem} onValueChange={v => setMeridiem(v as Meridiem)}>
            <SelectTrigger className="h-7 rounded-none border-0 text-xs">
              <SelectValue placeholder="AM" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[70]">
              <SelectItem className="text-xs" value="AM">
                AM
              </SelectItem>
              <SelectItem className="text-xs" value="PM">
                PM
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ✅ Wrap with memo to stop re-rendering on scroll
export default React.memo(DayCellComponent);
