import { parseISO } from "date-fns";

export const CHICAGO = "America/Chicago";

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CHICAGO,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CHICAGO,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: CHICAGO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function chicagoDay(date: Date): string {
  return dayKeyFormat.format(date);
}

export function addCalendarDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year!, month! - 1, day!));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function endOfChicagoWeek(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year!, month! - 1, day!));
  const daysUntilSunday = (7 - utc.getUTCDay()) % 7;
  return addCalendarDays(ymd, daysUntilSunday);
}

function timezoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const mapped: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") mapped[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(mapped.year),
    Number(mapped.month) - 1,
    Number(mapped.day),
    Number(mapped.hour),
    Number(mapped.minute),
    Number(mapped.second),
  );
  return asUtc - date.getTime();
}

export function chicagoDateTime(
  base: Date,
  dayOffset: number,
  hours: number,
  minutes = 0,
): string {
  const ymd = addCalendarDays(chicagoDay(base), dayOffset);
  const [year, month, day] = ymd.split("-").map(Number);
  const utcGuess = new Date(Date.UTC(year!, month! - 1, day!, hours, minutes, 0));
  const offset = timezoneOffsetMs(utcGuess, CHICAGO);
  const corrected = new Date(utcGuess.getTime() - offset);
  const refined = timezoneOffsetMs(corrected, CHICAGO);
  return new Date(utcGuess.getTime() - refined).toISOString();
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateTimeFormat.format(parseISO(iso));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateFormat.format(parseISO(iso));
}

const headingFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CHICAGO,
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function formatDayHeading(date: Date): string {
  return headingFormat.format(date);
}
