"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApprovalStatus } from "@/components/data-display/indicators";
import { QueryState } from "@/components/feedback/query-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { proposalsApi } from "@/lib/api";
import { proposalSlotDenial } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import {
  PROPOSAL_SECTIONS,
  type Proposal,
  type ProposalSectionKey,
} from "@/types/domain";

const LABELS: Record<ProposalSectionKey, string> = {
  inclusions: "Inclusions",
  exclusions: "Exclusions",
  clarifications: "Clarifications",
  alternates: "Alternates",
  pricing: "Pricing",
  addenda: "Addenda acknowledgements",
};

export function ProposalPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const proposal = useQuery({
    queryKey: queryKeys.proposals.detail(projectId),
    queryFn: ({ signal }) => proposalsApi.get(projectId, signal),
  });
  const server = proposal.data ?? null;
  const [edited, setEdited] = useState<{ base: Proposal; draft: Proposal } | null>(null);
  const draft = server && edited?.base === server ? edited.draft : server;

  function setDraft(next: Proposal | ((current: Proposal) => Proposal)) {
    if (!server) return;
    const current = edited?.base === server ? edited.draft : server;
    const resolved = typeof next === "function" ? next(current) : next;
    setEdited({ base: server, draft: resolved });
  }

  const save = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error("Nothing to save.");
      return proposalsApi.update(projectId, draft.sections, role);
    },
    onSuccess: async () => {
      toast.success("Proposal draft saved. Approvals were cleared if any existed.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });
  const approve = useMutation({
    mutationFn: () => proposalsApi.approve(projectId, role),
    onSuccess: async () => {
      toast.success("Your approval slot was recorded. Both leads are still required.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Approval failed."),
  });
  const acknowledge = useMutation({
    mutationFn: (id: string) => proposalsApi.acknowledge(projectId, id, role),
    onSuccess: async () => {
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not acknowledge."),
  });

  const slot =
    role === "precon_lead"
      ? "precon"
      : role === "construction_lead"
        ? "construction"
        : null;
  const slotReason = slot
    ? proposalSlotDenial(role, slot)
    : proposalSlotDenial(role, "precon");
  const already = slot && draft ? draft.approvals[slot].status === "approved" : false;

  function download() {
    if (!draft) return;
    const text = PROPOSAL_SECTIONS.map(
      (key) => `${LABELS[key]}\n${draft.sections[key]}`,
    ).join("\n\n");
    const blob = new Blob(
      [
        `SIMULATED PROPOSAL DRAFT\nThis file was generated in the browser and was not submitted.\n\n${text}`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "northline-proposal-draft.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <QueryState
      isPending={proposal.isPending}
      isError={proposal.isError}
      error={proposal.error}
      onRetry={() => void proposal.refetch()}
    >
      {draft ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid gap-4">
            {PROPOSAL_SECTIONS.map((key) => (
              <label key={key} className="grid gap-1 text-sm font-medium">
                {LABELS[key]}
                <Textarea
                  value={draft.sections[key]}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      sections: { ...draft.sections, [key]: event.target.value },
                    })
                  }
                />
              </label>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                Save draft
              </Button>
              <Button variant="secondary" onClick={download}>
                Download draft (simulated)
              </Button>
            </div>
            <section>
              <h2 className="text-sm font-semibold">Addenda</h2>
              <ul className="mt-2 grid gap-2">
                {draft.addendaAcknowledged.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>
                      {item.label} ·{" "}
                      {item.acknowledged ? "Acknowledged" : "Not acknowledged"}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={item.acknowledged || acknowledge.isPending}
                      onClick={() => acknowledge.mutate(item.id)}
                    >
                      Acknowledge
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-sm font-semibold">Unverified</h2>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {draft.unverifiedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
          <aside className="border-line bg-surface grid content-start gap-4 border p-4">
            <h2 className="text-sm font-semibold">Proposal preview</h2>
            <article className="grid gap-3 text-sm">
              {PROPOSAL_SECTIONS.map((key) => (
                <section key={key}>
                  <h3 className="font-medium">{LABELS[key]}</h3>
                  <p className="text-muted whitespace-pre-wrap">{draft.sections[key]}</p>
                </section>
              ))}
            </article>
            <ApprovalStatus
              slots={[
                {
                  label: "Precon / Design Lead",
                  approved: draft.approvals.precon.status === "approved",
                },
                {
                  label: "Construction Lead",
                  approved: draft.approvals.construction.status === "approved",
                },
              ]}
            />
            <p className="text-muted text-sm">
              Both human leads must approve. The assistant cannot approve either slot.
            </p>
            {slotReason ? <p className="text-muted text-sm">{slotReason}</p> : null}
            <Button
              disabled={Boolean(slotReason) || already || approve.isPending}
              onClick={() => approve.mutate()}
            >
              {already ? "Your slot is approved" : "Approve my slot"}
            </Button>
          </aside>
        </div>
      ) : null}
    </QueryState>
  );
}
