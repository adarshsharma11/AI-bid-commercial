import type {
  Project,
  ProjectStatus,
  ReportPoint,
  ReportRange,
  ReportSummary,
  Trade,
} from "@/types/domain";
import { PROJECT_STATUSES, TRADES } from "@/types/domain";
import { addCalendarDays, chicagoDay } from "@/lib/utils/dates";

export type ReportViewFilters = {
  trade: Trade | "all";
  gcId: string | "all";
};

const SUBMITTED: ProjectStatus[] = ["submitted", "won", "lost"];
const ACTIVE: ProjectStatus[] = ["new", "screening", "go", "reviewing", "pricing"];

function hitRate(won: number, lost: number): number | null {
  const decided = won + lost;
  if (decided === 0) return null;
  return won / decided;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildReport(
  projects: Project[],
  contractors: { id: string; name: string }[],
  range: ReportRange,
  now: Date,
): ReportSummary {
  const start = addCalendarDays(chicagoDay(now), -Number(range));
  const points: ReportPoint[] = projects.map((project) => ({
    gcId: project.gcId,
    gcName:
      contractors.find((contractor) => contractor.id === project.gcId)?.name ??
      "Unknown GC",
    trade: project.trade,
    status: project.status,
    value: project.estimatedValue,
    bidDueAt: project.bidDueAt,
    samplePreconHours: project.samplePreconHours,
    inRange: chicagoDay(new Date(project.bidDueAt)) >= start,
    active: ACTIVE.includes(project.status),
  }));

  return summarize(range, points);
}

function monthKey(iso: string): string {
  const day = chicagoDay(new Date(iso));
  return day.slice(0, 7);
}

function summarize(range: ReportRange, points: ReportPoint[]): ReportSummary {
  const inRange = points.filter((point) => point.inRange);
  const submitted = inRange.filter((point) => SUBMITTED.includes(point.status));
  const wins = submitted.filter((point) => point.status === "won");
  const losses = submitted.filter((point) => point.status === "lost");
  const sizes = submitted
    .map((point) => point.value)
    .filter((value): value is number => value != null);
  const hours = inRange
    .map((point) => point.samplePreconHours)
    .filter((value): value is number => value != null);
  const active = points.filter((point) => point.active);
  const contractors = uniqueContractors(points);

  return {
    range,
    demonstration: true,
    bidsSubmitted: submitted.length,
    wins: wins.length,
    losses: losses.length,
    winRate: hitRate(wins.length, losses.length),
    averageBidSize: average(sizes),
    pipelineValue: active.reduce((sum, point) => sum + (point.value ?? 0), 0),
    hoursSpent: hours.length ? hours.reduce((sum, value) => sum + value, 0) : null,
    byContractor: contractors.map((contractor) => {
      const rows = submitted.filter((point) => point.gcId === contractor.id);
      const won = rows.filter((point) => point.status === "won").length;
      const lost = rows.filter((point) => point.status === "lost").length;
      return {
        id: contractor.id,
        name: contractor.name,
        won,
        lost,
        hitRate: hitRate(won, lost),
      };
    }),
    byTrade: TRADES.map((trade: Trade) => {
      const rows = submitted.filter((point) => point.trade === trade);
      const won = rows.filter((point) => point.status === "won").length;
      const lost = rows.filter((point) => point.status === "lost").length;
      return { trade, won, lost, hitRate: hitRate(won, lost) };
    }).filter((row) => row.won + row.lost > 0),
    pipelineByStatus: PROJECT_STATUSES.filter((status) => ACTIVE.includes(status)).map(
      (status) => {
        const rows = active.filter((point) => point.status === status);
        return {
          status,
          count: rows.length,
          value: rows.reduce((sum, point) => sum + (point.value ?? 0), 0),
        };
      },
    ),
    points,
    valueByMonth: monthTotals(inRange),
  };
}

function uniqueContractors(points: ReportPoint[]): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const point of points) seen.set(point.gcId, point.gcName);
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

function monthTotals(points: ReportPoint[]): { month: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const point of points) {
    if (point.value == null) continue;
    const key = monthKey(point.bidDueAt);
    totals.set(key, (totals.get(key) ?? 0) + point.value);
  }
  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, value]) => ({ month, value }));
}

export function viewReport(
  summary: ReportSummary,
  filters: ReportViewFilters,
): ReportSummary {
  const points = summary.points.filter(
    (point) =>
      (filters.trade === "all" || point.trade === filters.trade) &&
      (filters.gcId === "all" || point.gcId === filters.gcId),
  );
  return summarize(summary.range, points);
}
