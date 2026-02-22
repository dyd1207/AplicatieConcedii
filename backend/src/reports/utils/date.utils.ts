export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/**
 * Luni ca început de săptămână.
 */
export function startOfWeekMonday(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0..6 (0 = duminică)
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  return addDays(d, diffToMonday);
}

export function startOfMonth(year: number, month1to12: number) {
  return new Date(year, month1to12 - 1, 1, 0, 0, 0, 0);
}

export function startOfYear(year: number) {
  return new Date(year, 0, 1, 0, 0, 0, 0);
}