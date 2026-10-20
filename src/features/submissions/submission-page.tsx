"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { QueryState } from "@/components/feedback/query-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { proposalsApi, submissionsApi } from "@/lib/api";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/utils/dates";

export function SubmissionPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const [note, setNote] = useState("");
  const submission = useQuery({
    queryKey: queryKeys.submissions.detail(projectId),
    queryFn: ({ signal }) => submissionsApi.get(projectId, signal),
  });
  const proposal = useQuery({
    queryKey: queryKeys.proposals.detail(projectId),
    queryFn: ({ signal }) => proposalsApi.get(projectId, signal),
  });
  const submit = useMutation({
    mutationFn: () => submissionsApi.submit(projectId, role),
    onSuccess: async () => {
      toast.success("Submission simulated. Nothing was sent to the GC.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Submission blocked."),
  });
  const outcome = useMutation({
    mutationFn: (value: "won" | "lost") =>
      submissionsApi.recordOutcome(projectId, value, note, role),
    onSuccess: async () => {
      toast.success("Outcome recorded in demo data.");
      await refresh();
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Could not record the outcome.",
      ),
  });
  const bothApproved =
    proposal.data?.approvals.precon.status === "approved" &&
    proposal.data.approvals.construction.status === "approved";
  const submitReason = denialReason(role, "submit_bid");
  const outcomeReason = denialReason(role, "record_outcome");

  return (
    <QueryState
      isPending={submission.isPending}
      isError={submission.isError}
      error={submission.error}
      onRetry={() => void submission.refetch()}
    >
      {submission.data ? (
        <div className="grid max-w-3xl gap-5">
          <p className="text-muted text-sm">
            Simulated submission.{" "}
            {submission.data.submittedAt
              ? `Marked submitted ${formatDateTime(submission.data.submittedAt)}.`
              : "Not submitted."}
          </p>
          <ul className="divide-line border-line bg-surface divide-y border">
            {submission.data.requiredDocuments.map((document) => (
              <li key={document.name} className="flex justify-between px-3 py-2 text-sm">
                <span>{document.name}</span>
                <span>{document.ready ? "Ready" : "Missing"}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm">
            Proposal approvals:{" "}
            {bothApproved ? "both leads approved" : "waiting on both human leads"}.
          </p>
          {submitReason ? <p className="text-muted text-sm">{submitReason}</p> : null}
          {!bothApproved ? (
            <p className="text-muted text-sm">
              Submission stays disabled until both leads approve the proposal.
            </p>
          ) : null}
          <Button
            disabled={Boolean(submitReason) || !bothApproved || submit.isPending}
            onClick={() => submit.mutate()}
          >
            Mark submitted (simulated)
          </Button>
          <section className="border-line grid gap-2 border-t pt-4">
            <h2 className="text-sm font-semibold">Bid outcome</h2>
            <p className="text-sm">
              Current: {submission.data.outcome ?? "Not recorded"}
            </p>
            <Textarea
              aria-label="Outcome note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            {outcomeReason ? <p className="text-muted text-sm">{outcomeReason}</p> : null}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={Boolean(outcomeReason) || outcome.isPending}
                onClick={() => outcome.mutate("won")}
              >
                Record won
              </Button>
              <Button
                variant="secondary"
                disabled={Boolean(outcomeReason) || outcome.isPending}
                onClick={() => outcome.mutate("lost")}
              >
                Record lost
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </QueryState>
  );
}
