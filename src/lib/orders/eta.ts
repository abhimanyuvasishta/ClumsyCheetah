import { formatIst } from "@/lib/time";

export function hoursFromProducts(
  rows: { preparation_time_hours?: number | null; delivery_time_hours?: number | null }[],
): number {
  let max = 0;
  for (const row of rows) {
    const prep = Math.max(0, row.preparation_time_hours ?? 0);
    const delivery = Math.max(0, row.delivery_time_hours ?? 0);
    max = Math.max(max, prep + delivery);
  }
  return max > 0 ? max : 4;
}

export function promisedAtFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export const ETA_QUARTER_MS = 15 * 60 * 1000;
export const ETA_MESSAGE_MAX = 400;

export function sanitizeEtaMessage(raw: string): string | null {
  const cleaned = raw
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, ETA_MESSAGE_MAX);
  return cleaned || null;
}

export function ceilToQuarterHour(date: Date): Date {
  return new Date(Math.ceil(date.getTime() / ETA_QUARTER_MS) * ETA_QUARTER_MS);
}

export function isQuarterHour(date: Date): boolean {
  return date.getTime() % ETA_QUARTER_MS === 0;
}

export function etaQuarterHourSlots(
  from = new Date(),
  hoursAhead = 16,
): { value: string; label: string }[] {
  const start = ceilToQuarterHour(from);
  const end = from.getTime() + hoursAhead * 60 * 60 * 1000;
  const slots: { value: string; label: string }[] = [];
  for (let t = start.getTime(); t <= end; t += ETA_QUARTER_MS) {
    const date = new Date(t);
    slots.push({ value: date.toISOString(), label: formatIst(date) });
  }
  return slots;
}

