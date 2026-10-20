"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApprovalStatus } from "@/components/data-display/indicators";
import { QueryState } from "@/components/feedback/query-state";
import { SectionHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { activityApi, projectsApi, proposalsApi } from "@/lib/api";
import { AI_RECOMMENDATION_LABEL, HUMAN_DECISION_LABEL } from "@/lib/constants/labels";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/utils/dates";

export function OverviewPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: ({ signal }) => projectsApi.getById(projectId, signal),
  });
  const proposal = useQuery({
    queryKey: queryKeys.proposals.detail(projectId),
    queryFn: ({ signal }) => proposalsApi.get(projectId, signal),
  });
  const activity = useQuery({
    queryKey: queryKeys.activity.list(projectId),
    queryFn: ({ signal }) => activityApi.list(projectId, signal),
  });
  const [note, setNote] = useState("Pursue if scope and access check out.");
  const decision = useMutation({
    mutationFn: (value: "go" | "no_go") =>
      projectsApi.decide(projectId, value, note, role),
    onSuccess: async () => {
      toast.success("Human decision saved in this demo.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Decision was not saved."),
  });
  const reason = denialReason(role, "decide_go_no_go");

  return (
    <QueryState
      isPending={project.isPending}
      isError={project.isError}
      error={project.error}
      onRetry={() => void project.refetch()}
    >
      {project.data ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <div className="grid gap-6">
            <section className="border-line bg-surface grid gap-3 border p-4">
              <SectionHeader
                title="AI recommendation"
                description="A suggestion only. It does not decide the bid."
              />
              <p className="text-lg font-semibold">
                {AI_RECOMMENDATION_LABEL[project.data.aiRecommendation]}
              </p>
              <p className="text-muted text-sm">Score {project.data.aiScore} of 100</p>
              <p className="text-sm">{project.data.aiRationale}</p>
            </section>
            <section className="border-line bg-surface grid gap-3 border p-4">
              <SectionHeader
                title="Human decision"
                description="Construction Lead only."
              />
              <p className="text-sm">
                {project.data.humanDecision
                  ? `${HUMAN_DECISION_LABEL[project.data.humanDecision]}. ${project.data.humanDecisionNote ?? ""}`
                  : "No human go/no-go decision yet."}
              </p>
              <Textarea
                aria-label="Decision note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              {reason ? <p className="text-muted text-sm">{reason}</p> : null}
              <div className="flex gap-2">
                <Button
                  disabled={Boolean(reason) || decision.isPending}
                  onClick={() => decision.mutate("go")}
                >
                  Record go
                </Button>
                <Button
                  variant="secondary"
                  disabled={Boolean(reason) || decision.isPending}
                  onClick={() => decision.mutate("no_go")}
                >
                  Record no go
                </Button>
              </div>
            </section>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Fact
                label="General contractor"
                value={`${project.data.gcName} · ${project.data.gcContactName}`}
              />
              <Fact
                label="Contact"
                value={`${project.data.gcContactEmail} · ${project.data.gcContactPhone}`}
              />
              <Fact
                label="Bid due"
                value={`${formatDateTime(project.data.bidDueAt)} · ${project.data.timezone}`}
              />
              <Fact label="Site visit" value={formatDateTime(project.data.siteVisitAt)} />
              <Fact label="RFI deadline" value={formatDateTime(project.data.rfiDueAt)} />
              <Fact
                label="Next action"
                value={`${project.data.nextAction} · ${project.data.ownerName}`}
              />
              <Fact
                label="Document completeness"
                value={`${project.data.documentCompleteness}%`}
              />
            </dl>
          </div>
          <div className="grid content-start gap-6">
            <section className="border-line bg-surface border p-4">
              <h2 className="mb-3 text-sm font-semibold">Outstanding approvals</h2>
              {project.data.outstandingApprovals.length === 0 ? (
                <p className="text-muted text-sm">Nothing is waiting.</p>
              ) : (
                <ul className="grid gap-2 text-sm">
                  {project.data.outstandingApprovals.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {proposal.data ? (
                <div className="border-line mt-4 border-t pt-4">
                  <ApprovalStatus
                    slots={[
                      {
                        label: "Precon proposal",
                        approved: proposal.data.approvals.precon.status === "approved",
                      },
                      {
                        label: "Construction proposal",
                        approved:
                          proposal.data.approvals.construction.status === "approved",
                      },
                    ]}
                  />
                </div>
              ) : null}
            </section>
            <section>
              <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
              <ol className="border-line grid gap-3 border-l pl-4">
                {activity.data?.slice(0, 5).map((event) => (
                  <li key={event.id}>
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-muted text-xs">{formatDateTime(event.at)}</p>
                    <p className="text-sm">{event.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      ) : null}
    </QueryState>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line bg-surface border px-3 py-2">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
