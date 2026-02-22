/**
 * Diferență în zile calendaristice: [start, end) (end exclusiv)
 */
export function diffDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function calculateEffectiveDays(input: {
  status: string;
  startDate: Date;
  endDate: Date;
  interruptedAt: Date | null;
  daysCount: number;
}): number {
  if (input.status !== "APPROVED") return 0;

  // dacă nu e întreruptă, rămânem consistenți cu daysCount (cum ai salvat tu)
  if (!input.interruptedAt) return input.daysCount;

  const effectiveEnd = input.interruptedAt < input.endDate ? input.interruptedAt : input.endDate;
  return diffDays(input.startDate, effectiveEnd);
}