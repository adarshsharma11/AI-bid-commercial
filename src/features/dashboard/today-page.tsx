"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { DeadlineIndicator, InlineMetadata } from "@/components/data-display/indicators";
import { ProjectStatusBadge } from "@/components/data-display/status-badge";
import { QueryState } from "@/components/feedback/query-state";
import { PageSkeleton } from "@/components/ui/skeleton";
import { PageContainer, PageHeader, SectionHeader } from "@/components/layout/page";
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
          <div className="grid gap-8">
            <dl className="border-line bg-surface sm:divide-line grid grid-cols-2 border sm:grid-cols-4 sm:divide-x">
              <Metric label="Active bids" value={String(data.activeBids)} />
              <Metric label="Submitted" value={String(data.submittedBids)} />
              <Metric label="Due this week" value={String(data.deadlinesThisWeek)} />
              <Metric label="Awaiting review" value={String(data.awaitingReview)} />
            </dl>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
              <section className="grid gap-3">
                <SectionHeader
                  title="Next actions"
                  description="Ordered by the next due date on each active bid."
                />
                <ul className="divide-line border-line bg-surface divide-y border">
                  {data.nextActions.map((item) => (
                    <li key={item.project.id}>
                      <Link
                        href={`/projects/${item.project.id}`}
                        className="hover:bg-surface-muted grid gap-1 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
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

              <div className="grid gap-6">
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
            </div>

            <section className="grid gap-3">
              <SectionHeader title="Tasks by owner" />
              <div className="grid gap-4 lg:grid-cols-3">
                {TASK_GROUPS.map((group) => (
                  <div key={group}>
                    <h3 className="mb-2 text-sm font-medium">
                      {TASK_GROUP_LABEL[group]}
                    </h3>
                    <ul className="divide-line border-line bg-surface divide-y border">
                      {data.tasks
                        .filter((task) => task.ownerGroup === group)
                        .map((task) => (
                          <li key={task.id}>
                            <Link
                              href={task.href}
                              className="hover:bg-surface-muted block px-3 py-2.5"
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

            <div className="grid gap-8 lg:grid-cols-2">
              <section className="grid gap-3">
                <SectionHeader
                  title="Overdue"
                  description="Open tasks past their due date."
                />
                {data.overdue.length === 0 ? (
                  <p className="text-muted text-sm">Nothing is overdue.</p>
                ) : (
                  <ul className="divide-line border-line bg-surface divide-y border">
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
              <section className="grid gap-3">
                <SectionHeader title="Needs a decision" />
                <ul className="divide-line border-line bg-surface divide-y border">
                  {data.approvals.map((item) => (
                    <li key={item.project.id + item.label}>
                      <Link
                        href={item.href}
                        className="hover:bg-surface-muted flex items-center justify-between gap-3 px-3 py-2.5"
                      >
                        <span>
                          <span className="block text-sm font-medium">
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
            </div>

            <section className="grid gap-3">
              <SectionHeader
                title="Recently received"
                description="Invitations, addenda, quotes, and replies in the demo inbox."
              />
              <ul className="divide-line border-line bg-surface divide-y border">
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
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
    <section className="grid gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-muted text-sm">{empty}</p>
      ) : (
        <ul className="divide-line border-line bg-surface divide-y border">
          {items.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className="hover:bg-surface-muted block px-3 py-2.5">
                <span className="text-sm font-medium">{item.title}</span>
                <InlineMetadata items={[item.meta]} />
                <span className="mt-1 block">
                  <DeadlineIndicator iso={item.iso} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
