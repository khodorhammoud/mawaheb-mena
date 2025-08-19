import { useState } from 'react';
import { addWeeks, weekRangeFor } from '../utils/date';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { NO_FOCUS_BTN } from '~/lib/tw';

export default function Header() {
  const [anchor, setAnchor] = useState<Date>(new Date());
  const { start, end, label } = weekRangeFor(anchor);

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base md:text-lg font-semibold tracking-tight">
          Week: <span className="font-medium">{label(start)}</span> —{' '}
          <span className="font-medium">{label(end)}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border">
            <Button size="sm" variant="secondary" className="rounded-none">
              Weekly
            </Button>
            <Button size="sm" variant="ghost" className="rounded-none">
              Monthly
            </Button>
          </div>

          <div className="inline-flex rounded-md border ml-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAnchor(addWeeks(anchor, -1))}
              aria-label="Previous week"
            >
              ←
            </Button>
            <Button size="sm" variant="ghost" aria-label="Pick week">
              📅
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAnchor(addWeeks(anchor, 1))}
              aria-label="Next week"
            >
              →
            </Button>
          </div>

          <Button size="sm" variant="outline">
            Record Absence
          </Button>
          <Button
            size="sm"
            className={cn('bg-blue-600 hover:bg-blue-700 text-white', NO_FOCUS_BTN)}
          >
            Submit week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 mt-4 divide-x rounded-lg border overflow-hidden">
        <Stat title="HOURS" primary="0.00h" secondary="0 pending" />
        <Stat title="AMOUNT" primary="€0.00" secondary="€0.00 pending" />
        <Stat title="EXPENSES" primary="€0.00" secondary="€0.00 pending" />
        <Stat title="VACATION DAYS" primary="0" secondary="0 pending" />
      </div>
    </div>
  );
}

type StatProps = { title: string; primary: string; secondary: string };

function Stat({ title, primary, secondary }: StatProps) {
  return (
    <div className="p-3 md:p-4 bg-white">
      <div className="text-[10px] md:text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="text-lg md:text-2xl font-semibold">{primary}</div>
      <div className="text-[11px] md:text-xs text-gray-400">{secondary}</div>
    </div>
  );
}
