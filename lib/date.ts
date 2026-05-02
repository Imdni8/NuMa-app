export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function shiftDateKey(key: string, deltaDays: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return dateKey(date);
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getWeekStartKey(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const daysBack = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysBack);
  return dateKey(date);
}

export function getWeekDayKeys(weekStartKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDateKey(weekStartKey, i));
}

export function isCurrentWeek(weekStartKey: string): boolean {
  return weekStartKey === getWeekStartKey(todayKey());
}

export function formatWeekRange(weekStartKey: string): string {
  const [, m1, d1] = weekStartKey.split('-').map(Number);
  const endKey = shiftDateKey(weekStartKey, 6);
  const [, m2, d2] = endKey.split('-').map(Number);
  return `${d1} ${MONTH_SHORT[m1 - 1]} - ${d2} ${MONTH_SHORT[m2 - 1]}`;
}

export function dayOfWeekShort(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return DAY_SHORT[date.getDay()];
}

function ordinalSuffix(d: number): string {
  if (d >= 11 && d <= 13) return 'th';
  switch (d % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function dayAccordionLabel(dayKey: string): string {
  const today = todayKey();
  if (dayKey === today) return 'Today';
  if (dayKey === shiftDateKey(today, -1)) return 'Yesterday';
  const [, m, d] = dayKey.split('-').map(Number);
  return `${d}${ordinalSuffix(d)} ${MONTH_SHORT[m - 1]}`;
}
