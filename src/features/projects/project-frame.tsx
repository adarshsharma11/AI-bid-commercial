"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { DeadlineIndicator, InlineMetadata } from "@/components/data-display/indicators";
import { ProjectStatusBadge } from "@/components/data-display/status-badge";
import { QueryState } from "@/components/feedback/query-state";
import { Breadcrumbs, PageContainer } from "@/components/layout/page";
import { TabBar } from "@/components/navigation/tab-bar";
import { PageSkeleton } from "@/components/ui/skeleton";
import { projectsApi } from "@/lib/api";
import { TRADE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrency } from "@/lib/utils/currency";

const TABS = [
  { href: "", label: "Overview" },
  { href: "/documents", label: "Documents" },
  { href: "/scope", label: "Scope Review" },
  { href: "/takeoff", label: "Takeoff" },
  { href: "/rfis", label: "RFIs" },
  { href: "/quotes", label: "Quotes" },
  { href: "/estimate", label: "Estimate" },
  { href: "/proposal", label: "Proposal" },
  { href: "/submission", label: "Submission" },
  { href: "/activity", label: "Activity Log" },
];

export function ProjectFrame({ children }: { children: ReactNode }) {
  const params = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const projectId = params.projectId;
  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: ({ signal }) => projectsApi.getById(projectId, signal),
  });

  return (
    <PageContainer>
      <QueryState
        isPending={project.isPending}
        isFetching={project.isFetching}
        isError={project.isError}
        error={project.error}
        onRetry={() => void project.refetch()}
        pendingLabel="Loading project"
        skeleton={<PageSkeleton label="Loading project" />}
      >
        {project.data ? (
          <div className="grid gap-5">
            <Breadcrumbs
              items={[
                { label: "Pipeline", href: "/pipeline" },
                { label: project.data.name },
              ]}
            />
            <header className="border-line grid gap-3 border-b pb-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {project.data.name}
                  </h1>
                  <ProjectStatusBadge status={project.data.status} />
                </div>
                <InlineMetadata
                  items={[
                    project.data.number,
                    `${project.data.location}, ${project.data.city}`,
                    project.data.gcName,
                    TRADE_LABEL[project.data.trade],
                    formatCurrency(project.data.estimatedValue),
                  ]}
                />
              </div>
              <DeadlineIndicator iso={project.data.bidDueAt} />
            </header>
            <TabBar
              label="Project"
              activeId={
                TABS.find((tab) => {
                  const href = `/projects/${projectId}${tab.href}`;
                  return tab.href === "" ? pathname === href : pathname.startsWith(href);
                })?.href ?? ""
              }
              tabs={TABS.map((tab) => ({
                id: tab.href,
                label: tab.label,
                href: `/projects/${projectId}${tab.href}`,
              }))}
            />
            {children}
          </div>
        ) : null}
      </QueryState>
    </PageContainer>
  );
}
