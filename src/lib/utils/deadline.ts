import { addCalendarDays, chicagoDay, endOfChicagoWeek } from "@/lib/utils/dates";

export const DUE_SOON_DAYS = 3;

export type DeadlineTone = "overdue" | "today" | "soon" | "upcoming" | "none";

export function classifyDeadline(
  iso: string | null | undefined,
  now: Date,
): DeadlineTone {
  if (!iso) return "none";
  const due = chicagoDay(new Date(iso));
  const today = chicagoDay(now);
  if (due < today) return "overdue";
  if (due === today) return "today";
  const soonLimit = addCalendarDays(today, DUE_SOON_DAYS);
  if (due <= soonLimit) return "soon";
  return "upcoming";
}

export function isDueThisWeek(iso: string | null | undefined, now: Date): boolean {
  if (!iso) return false;
  const due = chicagoDay(new Date(iso));
  const today = chicagoDay(now);
  if (due < today) return false;
  return due <= endOfChicagoWeek(today);
}

export function deadlineLabel(tone: DeadlineTone): string {
  switch (tone) {
    case "overdue":
      return "Overdue";
    case "today":
      return "Due today";
    case "soon":
      return "Due soon";
    case "upcoming":
      return "Upcoming";
    case "none":
      return "No date";
  }
}
