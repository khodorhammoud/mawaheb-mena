import { daysOfCurrentWeekLabels, daysOfCurrentWeekISO } from '../utils/date';
import DayCell from './DayCell';

type Props = {
  ids: { freelancerId: number; jobApplicationId: number };
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default function ProjectRow({ ids }: Props) {
  const labels = daysOfCurrentWeekLabels();
  const isoDays = daysOfCurrentWeekISO();
  const today = ymd(new Date());

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="text-sm text-gray-600">
          <span className="font-medium">PHP / Vue.js Fullstack Developer</span>
          <span className="ml-2">• EGcom GmbH</span>
          <span className="ml-2">BI-PV-IA-1</span>
        </div>
        <div className="text-sm text-gray-500">0.00h • €0.00</div>
      </div>

      <div className="grid grid-cols-7 gap-2 p-3">
        {labels.map((label, i) => (
          <DayCell
            key={isoDays[i]}
            dateLabel={label}
            dateISO={isoDays[i]}
            jobApplicationId={ids.jobApplicationId}
            locked={false}
            isFuture={false}
            isToday={isoDays[i] === today}
            entries={[]} // no data yet; passes shape expected by DayCell
          />
        ))}
      </div>
    </div>
  );
}
