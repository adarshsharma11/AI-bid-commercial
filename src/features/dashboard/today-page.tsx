"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ClipboardList, FolderOpen, Send } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { DeadlineIndicator, InlineMetadata } from "@/components/data-display/indicators";
import { ProjectStatusBadge } from "@/components/data-display/status-badge";
import { QueryState } from "@/components/feedback/query-state";
import { PageContainer, PageHeader, SectionHeader } from "@/components/layout/page";
import { PageSkeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api";
import { TASK_GROUP_LABEL, TRADE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime, formatDayHeading } from "@/lib/utils/dates";
import { TASK_GROUPS } from "@/types/domain";

export function TodayPage() {
  const summary = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: ({ signal }) => dashboardApi.getSummary(signal),
  });
  const data = summary.data;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={formatDayHeading(new Date())}
        title="Today"
        description="Deadlines, visits, and decisions for Summit Coatings. Sample activity, not a live feed."
      />
      <QueryState
        isPending={summary.isPending}
        isFetching={summary.isFetching}
        isError={summary.isError}
        error={summary.error}
        onRetry={() => void summary.refetch()}
        pendingLabel="Loading today"
        skeleton={<PageSkeleton label="Loading today" />}
      >
        {data ? (
          <div className="grid gap-4">
            <section className="rounded-2xl bg-[#10233a] p-4 text-white sm:p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                Today&apos;s workload
              </h2>
              <p className="mt-1 max-w-xl text-sm text-white/65">
                Deadlines, visits, and decisions in this demo workspace. Not a live feed.
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  icon={<FolderOpen className="h-4 w-4" />}
                  label="Active bids"
                  value={String(data.activeBids)}
                  hint="Open opportunities"
                />
                <Metric
                  icon={<Send className="h-4 w-4" />}
                  label="Submitted"
                  value={String(data.submittedBids)}
                  hint="Bids already sent"
                />
                <Metric
                  icon={<CalendarClock className="h-4 w-4" />}
                  label="Due this week"
                  value={String(data.deadlinesThisWeek)}
                  hint="Bid deadlines still ahead"
                  tone="positive"
                />
                <Metric
                  icon={<ClipboardList className="h-4 w-4" />}
                  label="Awaiting review"
                  value={String(data.awaitingReview)}
                  hint="Needs a person to look"
                />
              </dl>
            </section>

            <section className="border-line bg-surface overflow-hidden rounded-2xl border shadow-[var(--shadow-panel)]">
              <div className="px-4 pt-4 pb-2">
                <SectionHeader
                  title="Next actions"
                  description="Ordered by the next due date on each active bid."
                />
              </div>
              <ul className="divide-line divide-y">
                {data.nextActions.map((item) => (
                  <li key={item.project.id}>
                    <Link
                      href={`/projects/${item.project.id}`}
                      className="hover:bg-surface-muted grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    >
                      <span>
                        <span className="block text-sm font-medium">{item.action}</span>
                        <InlineMetadata
                          items={[
                            item.project.name,
                            item.ownerName,
                            TRADE_LABEL[item.project.trade],
                          ]}
                        />
                      </span>
                      <DeadlineIndicator iso={item.dueAt} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
              <SideList
                title="Bid deadlines"
                empty="No bids are due this week."
                items={data.deadlines.map((project) => ({
                  key: project.id,
                  href: `/projects/${project.id}`,
                  title: project.name,
                  meta: `${project.gcName} · ${formatCurrency(project.estimatedValue)}`,
                  iso: project.bidDueAt,
                }))}
              />
              <SideList
                title="Site visits"
                empty="No site visits on the calendar."
                items={data.siteVisits.map((visit) => ({
                  key: visit.project.id,
                  href: `/projects/${visit.project.id}`,
                  title: visit.project.name,
                  meta: visit.project.city,
                  iso: visit.at,
                }))}
              />
              <SideList
                title="RFI deadlines"
                empty="No open RFI deadlines."
                items={data.rfiDeadlines.map((item) => ({
                  key: `${item.project.id}-${item.label}`,
                  href: `/projects/${item.project.id}/rfis`,
                  title: `${item.label} · ${item.project.name}`,
                  meta: item.project.gcName,
                  iso: item.at,
                }))}
              />
            </div>

            <section className="border-line bg-surface overflow-hidden rounded-2xl border shadow-[var(--shadow-panel)]">
              <div className="px-4 pt-4 pb-3">
                <SectionHeader title="Tasks by owner" />
              </div>
              <div className="grid lg:grid-cols-3 lg:divide-x lg:divide-[var(--line)]">
                {TASK_GROUPS.map((group) => (
                  <div key={group} className="px-4 pb-4">
                    <h3 className="mb-2 text-sm font-medium">
                      {TASK_GROUP_LABEL[group]}
                    </h3>
                    <ul className="divide-line divide-y">
                      {data.tasks
                        .filter((task) => task.ownerGroup === group)
                        .map((task) => (
                          <li key={task.id}>
                            <Link
                              href={task.href}
                              className="hover:bg-surface-muted block py-2.5"
                            >
                              <span className="text-sm">{task.title}</span>
                              <span className="mt-1 block">
                                <DeadlineIndicator iso={task.dueAt} />
                              </span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid content-start gap-3">
              <SectionHeader
                title="Overdue"
                description="Open tasks past their due date."
              />
              {data.overdue.length === 0 ? (
                <p className="text-muted text-sm">Nothing is overdue.</p>
              ) : (
                <ul className="divide-line border-line bg-surface divide-y overflow-hidden rounded-2xl border">
                  {data.overdue.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="hover:bg-surface-muted block px-3 py-2.5"
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        <InlineMetadata
                          items={[item.project.name, formatDateTime(item.at)]}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="grid content-start gap-3">
              <SectionHeader title="Needs a decision" />
              <ul className="divide-line border-line bg-surface divide-y overflow-hidden rounded-2xl border">
                {data.approvals.map((item) => (
                  <li key={item.project.id + item.label}>
                    <Link
                      href={item.href}
                      className="hover:bg-surface-muted flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {item.project.name}
                        </span>
                        <span className="text-muted text-xs">{item.label}</span>
                      </span>
                      <ProjectStatusBadge status={item.project.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid gap-3">
              <SectionHeader
                title="Recently received"
                description="Invitations, addenda, quotes, and replies in the demo inbox."
              />
              <ul className="divide-line border-line bg-surface divide-y overflow-hidden rounded-2xl border">
                {data.recent.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="hover:bg-surface-muted grid gap-1 px-3 py-2.5 sm:grid-cols-[8rem_minmax(0,1fr)]"
                    >
                      <span className="text-muted text-xs capitalize">
                        {item.type.replaceAll("_", " ")}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{item.title}</span>
                        <span className="text-muted text-xs">{item.body}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </QueryState>
    </PageContainer>
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

function SideList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { key: string; href: string; title: string; meta: string; iso: string }[];
}) {
  return (
    <section className="border-line bg-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-panel)]">
      <h2 className="px-4 pt-3 text-sm font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-muted px-4 py-3 text-sm">{empty}</p>
      ) : (
        <ul className="divide-line mt-2 divide-y">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="hover:bg-surface-muted flex items-start justify-between gap-3 px-4 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.title}</span>
                  <InlineMetadata items={[item.meta]} />
                </span>
                <DeadlineIndicator iso={item.iso} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
