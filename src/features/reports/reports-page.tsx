"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, Percent, Receipt, TrendingUp } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState, QueryState } from "@/components/feedback/query-state";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Select } from "@/components/ui/input";
import { PageSkeleton, SkeletonChart } from "@/components/ui/skeleton";
import { reportsApi } from "@/lib/api";
import { PROJECT_STATUS_LABEL, TRADE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { useReducedMotion } from "@/lib/utils/motion";
import { viewReport } from "@/lib/utils/reports";
import { cn } from "@/lib/utils/cn";
import type { ReportRange, Trade } from "@/types/domain";
import { TRADES } from "@/types/domain";

export function ReportsPage() {
  const [range, setRange] = useState<ReportRange>("90");
  const [trade, setTrade] = useState<Trade | "all">("all");
  const [gcId, setGcId] = useState("all");
  const reducedMotion = useReducedMotion();
  const report = useQuery({
    queryKey: queryKeys.reports.detail(range),
    queryFn: ({ signal }) => reportsApi.get(range, signal),
    placeholderData: (previous) => previous,
  });
  const view = useMemo(
    () => (report.data ? viewReport(report.data, { trade, gcId }) : null),
    [report.data, trade, gcId],
  );
  const contractors = useMemo(() => {
    const seen = new Map<string, string>();
    for (const point of report.data?.points ?? []) seen.set(point.gcId, point.gcName);
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [report.data]);

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Demonstration metrics from the sample pipeline. They are not live business performance."
      />
      <QueryState
        isPending={report.isPending}
        isFetching={report.isFetching && !report.isPending}
        isError={report.isError}
        error={report.error}
        onRetry={() => void report.refetch()}
        pendingLabel="Loading reports"
        skeleton={
          <div className="grid gap-4">
            <PageSkeleton label="Loading reports" />
            <SkeletonChart />
          </div>
        }
      >
        {view ? (
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-5">
              <section className="border-line bg-surface rounded-2xl border p-4 shadow-[var(--shadow-panel)] lg:col-span-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">Bid value by month</h2>
                    <p className="text-muted mt-0.5 text-xs">
                      Estimated value of bids due in the selected window.
                    </p>
                  </div>
                  <DotLegend items={[{ label: "Estimated value", color: "#0f766e" }]} />
                </div>
                <div className="h-56">
                  <ValueChart rows={view.valueByMonth} reducedMotion={reducedMotion} />
                </div>
              </section>
              <RecentBids points={view.points} />
            </div>

            <section className="rounded-2xl bg-[#10233a] p-4 text-white sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    Pipeline performance
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-white/65">
                    Sample precon hours: {view.hoursSpent ?? "not recorded"}. Wins{" "}
                    {view.wins}, losses {view.losses}. No-go bids are excluded from win
                    rate. This is demonstration data only.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    aria-label="Date range"
                    className="w-auto bg-white"
                    value={range}
                    onChange={(event) => setRange(event.target.value as ReportRange)}
                  >
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last 365 days</option>
                  </Select>
                  <Select
                    aria-label="Trade"
                    className="w-auto bg-white"
                    value={trade}
                    onChange={(event) => setTrade(event.target.value as Trade | "all")}
                  >
                    <option value="all">All trades</option>
                    {TRADES.map((item) => (
                      <option key={item} value={item}>
                        {TRADE_LABEL[item]}
                      </option>
                    ))}
                  </Select>
                  <Select
                    aria-label="General contractor"
                    className="w-auto bg-white"
                    value={gcId}
                    onChange={(event) => setGcId(event.target.value)}
                  >
                    <option value="all">All general contractors</option>
                    {contractors.map((contractor) => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  icon={<Receipt className="h-4 w-4" />}
                  label="Bids submitted"
                  value={String(view.bidsSubmitted)}
                  hint="Submitted in the selected window"
                />
                <Metric
                  icon={<Banknote className="h-4 w-4" />}
                  label="Average bid size"
                  value={formatCurrency(view.averageBidSize)}
                  hint="Submitted bids with a value"
                />
                <Metric
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Win rate"
                  value={
                    view.winRate == null ? "—" : `${Math.round(view.winRate * 100)}%`
                  }
                  hint="Won divided by won plus lost"
                  tone="positive"
                />
                <Metric
                  icon={<Percent className="h-4 w-4" />}
                  label="Pipeline value"
                  value={formatCurrency(view.pipelineValue)}
                  hint="Open bids still in progress"
                />
              </dl>
            </section>

            {view.bidsSubmitted === 0 && view.pipelineValue === 0 ? (
              <EmptyState
                title="No demo bids match these filters"
                description="Choose another trade, general contractor, or date range."
              />
            ) : (
              <>
                <ChartCard
                  title="Active pipeline by status"
                  description="Open bids only. Submitted, won, lost, and no-go work is excluded."
                  legend={[{ label: "Bids", color: "#16a34a" }]}
                  height="h-80"
                >
                  <StatusChart
                    rows={view.pipelineByStatus}
                    reducedMotion={reducedMotion}
                  />
                </ChartCard>
                <div className="grid gap-4 lg:grid-cols-2">
                  <ChartCard
                    title="Win and loss by general contractor"
                    description="Won and lost counts in the selected window."
                    legend={[
                      { label: "Won", color: "#16a34a" },
                      { label: "Lost", color: "#ef4444" },
                    ]}
                  >
                    <WinLossChart
                      rows={view.byContractor.filter((row) => row.won + row.lost > 0)}
                      reducedMotion={reducedMotion}
                    />
                  </ChartCard>
                  <ChartCard
                    title="Bids by trade"
                    description="Won and lost bids in the filtered demo set."
                    legend={[
                      { label: "Won", color: "#16a34a" },
                      { label: "Lost", color: "#ef4444" },
                    ]}
                  >
                    <TradeChart rows={view.byTrade} reducedMotion={reducedMotion} />
                  </ChartCard>
                </div>
              </>
            )}
          </div>
        ) : null}
      </QueryState>
    </PageContainer>
  );
}

const tick = { fontSize: 12, fill: "#57534e" };
const grid = { stroke: "#e6e2db", strokeDasharray: "4 6", vertical: false } as const;
const axis = { tick, tickLine: false, axisLine: false } as const;

function ChartCard({
  title,
  description,
  legend,
  height = "h-72",
  children,
}: {
  title: string;
  description: string;
  legend: { label: string; color: string }[];
  height?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-line bg-surface rounded-2xl border p-4 shadow-[var(--shadow-panel)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-muted mt-1 text-xs">{description}</p>
        </div>
        <DotLegend items={legend} />
      </div>
      <div className={cn("mt-4", height)}>{children}</div>
    </section>
  );
}

function DotLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {items.map((item) => (
        <li key={item.label} className="text-muted flex items-center gap-1.5 text-xs">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: item.color }}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string | number;
  format?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-line bg-surface rounded-md border px-3 py-2 text-xs shadow-[var(--shadow-panel)]">
      <p className="font-medium">{label}</p>
      {payload.map((item) => (
        <p key={String(item.name)} className="text-muted mt-1">
          {item.name}: {format ? format(Number(item.value)) : String(item.value ?? "")}
        </p>
      ))}
    </div>
  );
}

function WinLossChart({
  rows,
  reducedMotion,
}: {
  rows: { name: string; won: number; lost: number }[];
  reducedMotion: boolean;
}) {
  if (rows.length === 0) return <ChartEmpty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} aria-label="Won and lost bids by general contractor">
        <CartesianGrid {...grid} />
        <XAxis dataKey="name" {...axis} interval={0} />
        <YAxis allowDecimals={false} width={32} {...axis} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f7f4ef" }} />
        <Bar
          dataKey="won"
          name="Won"
          fill="#16a34a"
          radius={[8, 8, 0, 0]}
          maxBarSize={56}
          isAnimationActive={!reducedMotion}
        />
        <Bar
          dataKey="lost"
          name="Lost"
          fill="#ef4444"
          radius={[8, 8, 0, 0]}
          maxBarSize={56}
          isAnimationActive={!reducedMotion}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TradeChart({
  rows,
  reducedMotion,
}: {
  rows: { trade: Trade; won: number; lost: number }[];
  reducedMotion: boolean;
}) {
  if (rows.length === 0) return <ChartEmpty />;
  const data = rows.map((row) => ({
    name: TRADE_LABEL[row.trade],
    won: row.won,
    lost: row.lost,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} aria-label="Bids by trade">
        <CartesianGrid {...grid} />
        <XAxis dataKey="name" {...axis} />
        <YAxis allowDecimals={false} width={32} {...axis} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f7f4ef" }} />
        <Bar
          dataKey="won"
          name="Won"
          fill="#16a34a"
          radius={[8, 8, 0, 0]}
          maxBarSize={56}
          isAnimationActive={!reducedMotion}
        />
        <Bar
          dataKey="lost"
          name="Lost"
          fill="#ef4444"
          radius={[8, 8, 0, 0]}
          maxBarSize={56}
          isAnimationActive={!reducedMotion}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ValueChart({
  rows,
  reducedMotion,
}: {
  rows: { month: string; value: number }[];
  reducedMotion: boolean;
}) {
  if (rows.length === 0) return <ChartEmpty />;
  const data = rows.map((row) => ({ ...row, label: monthLabel(row.month) }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} aria-label="Estimated bid value by month">
        <defs>
          <linearGradient id="bidValueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...grid} />
        <XAxis dataKey="label" {...axis} />
        <YAxis
          width={64}
          {...axis}
          tickFormatter={(value: number) => compactCurrency(value)}
        />
        <Tooltip
          content={<ChartTooltip format={formatCurrency} />}
          cursor={{ stroke: "#0f766e", strokeOpacity: 0.35 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="Estimated value"
          stroke="#0f766e"
          strokeWidth={2.5}
          fill="url(#bidValueFill)"
          dot={false}
          activeDot={{ r: 4, fill: "#0f766e" }}
          isAnimationActive={!reducedMotion}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusChart({
  rows,
  reducedMotion,
}: {
  rows: { status: keyof typeof PROJECT_STATUS_LABEL; count: number; value: number }[];
  reducedMotion: boolean;
}) {
  const data = rows
    .filter((row) => row.count > 0)
    .map((row) => ({
      name: PROJECT_STATUS_LABEL[row.status],
      count: row.count,
      value: row.value,
    }));
  if (data.length === 0) return <ChartEmpty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} aria-label="Active pipeline count by status">
        <CartesianGrid {...grid} />
        <XAxis dataKey="name" {...axis} />
        <YAxis allowDecimals={false} width={32} {...axis} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f7f4ef" }} />
        <Bar
          dataKey="count"
          name="Bids"
          fill="#16a34a"
          radius={[8, 8, 0, 0]}
          maxBarSize={72}
          isAnimationActive={!reducedMotion}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartEmpty() {
  return (
    <div className="text-muted flex h-full items-center px-2 text-sm">
      Nothing in this demo slice to chart.
    </div>
  );
}

function RecentBids({
  points,
}: {
  points: {
    gcName: string;
    status: keyof typeof PROJECT_STATUS_LABEL;
    value: number | null;
    bidDueAt: string;
    inRange: boolean;
  }[];
}) {
  const rows = points
    .filter((point) => point.inRange)
    .sort((left, right) => right.bidDueAt.localeCompare(left.bidDueAt))
    .slice(0, 6);
  return (
    <section className="border-line bg-surface flex flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-panel)] lg:col-span-2">
      <ul className="divide-line min-h-0 flex-1 divide-y">
        {rows.length === 0 ? (
          <li className="text-muted px-4 py-6 text-sm">No demo bids in this window.</li>
        ) : (
          rows.map((row, index) => (
            <li
              key={`${row.gcName}-${row.bidDueAt}-${row.status}-${index}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
            >
              <span className="text-muted tabular-nums">{formatDate(row.bidDueAt)}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{row.gcName}</span>
                <span className="text-muted text-xs">
                  {PROJECT_STATUS_LABEL[row.status]}
                </span>
              </span>
              <span
                className={
                  row.status === "won"
                    ? "font-medium text-emerald-600 tabular-nums"
                    : "tabular-nums"
                }
              >
                {formatCurrency(row.value)}
              </span>
            </li>
          ))
        )}
      </ul>
      <p className="border-line text-muted border-t px-4 py-3 text-sm">
        Demo bids in this window ({rows.length})
      </p>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "positive";
}) {
  const positive = tone === "positive";
  return (
    <div
      className={
        positive
          ? "relative rounded-xl bg-[#e7f8ef] px-4 py-3 text-[#166534]"
          : "bg-surface text-ink relative rounded-xl px-4 py-3"
      }
    >
      <span
        className={
          positive
            ? "absolute top-3 right-3 text-[#166534]"
            : "text-muted absolute top-3 right-3"
        }
        aria-hidden
      >
        {icon}
      </span>
      <dt className={positive ? "pr-6 text-xs" : "text-muted pr-6 text-xs"}>{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>
      <p className={positive ? "mt-1 text-xs" : "text-muted mt-1 text-xs"}>{hint}</p>
    </div>
  );
}

function monthLabel(month: string) {
  const [year, index] = month.split("-");
  const date = new Date(Date.UTC(Number(year), Number(index) - 1, 1));
  if (Number.isNaN(date.getTime())) return month;
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    date,
  );
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
