// Mon-start weeks; zero deps.

export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date, weekStartsOn: 0 | 1 = 1) {
  const s = startOfWeek(date, weekStartsOn);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

export function addWeeks(date: Date, w: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + w * 7);
  return d;
}

export function label(d: Date) {
  const day = d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return day.replace(',', '');
}

export function weekRangeFor(anchor: Date, weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(anchor, weekStartsOn);
  const end = endOfWeek(anchor, weekStartsOn);
  return { start, end, label };
}

export function daysOfCurrentWeekLabels(weekStartsOn: 0 | 1 = 1) {
  const s = startOfWeek(new Date(), weekStartsOn);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    out.push(
      d
        .toLocaleDateString(undefined, {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        })
        .replace(',', '')
    );
  }
  return out;
}

export function daysOfCurrentWeekISO(weekStartsOn: 0 | 1 = 1) {
  const s = startOfWeek(new Date(), weekStartsOn);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    out.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }
  return out;
}
