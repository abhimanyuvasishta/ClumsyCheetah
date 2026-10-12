export const IST_TIMEZONE = "Asia/Kolkata";

function asDate(value: string | Date | number): Date {
  return value instanceof Date ? value : new Date(value);
}

function istParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
  };
}

export function formatIst(value: string | Date | number): string {
  const date = asDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${formatted} IST`;
}

export function formatIstDate(value: string | Date | number): string {
  const date = asDate(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function istCalendarStamp(date = new Date()): string {
  const { year, month, day } = istParts(date);
  return `${year}${month}${day}`;
}

export function startOfIstDay(date = new Date()): Date {
  const { year, month, day } = istParts(date);
  return new Date(`${year}-${month}-${day}T00:00:00+05:30`);
}

export function toIstDatetimeLocal(date: Date): string {
  const { year, month, day, hour, minute } = istParts(date);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function parseIstDatetimeLocal(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date(Number.NaN);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}:00+05:30`);
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed) && !/[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}+05:30`);
  }
  return new Date(trimmed);
}
