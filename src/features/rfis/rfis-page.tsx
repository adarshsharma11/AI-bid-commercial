"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { SourceReference } from "@/components/data-display/indicators";
import { Badge } from "@/components/ui/badge";
import { QueryState } from "@/components/feedback/query-state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { rfisApi } from "@/lib/api";
import { RFI_STATUS_LABEL } from "@/lib/constants/labels";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/utils/dates";
import { rfiSchema } from "@/types/schemas";
import type { Rfi } from "@/types/domain";

export function RfisPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const rfis = useQuery({
    queryKey: queryKeys.rfis.list(projectId),
    queryFn: ({ signal }) => rfisApi.list(projectId, signal),
  });
  const [active, setActive] = useState<string | null>(null);
  const selected = rfis.data?.find((item) => item.id === active) ?? rfis.data?.[0];

  return (
    <QueryState
      isPending={rfis.isPending}
      isError={rfis.isError}
      error={rfis.error}
      onRetry={() => void rfis.refetch()}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <ul className="divide-line border-line bg-surface divide-y border">
          {rfis.data?.map((rfi) => (
            <li key={rfi.id}>
              <button
                type="button"
                className="hover:bg-surface-muted block w-full px-3 py-3 text-left"
                onClick={() => setActive(rfi.id)}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{rfi.number}</span>
                  <Badge tone={rfi.status === "sent" ? "info" : "warning"}>
                    {RFI_STATUS_LABEL[rfi.status]}
                  </Badge>
                </span>
                <span className="mt-1 block text-sm">{rfi.question}</span>
              </button>
            </li>
          ))}
        </ul>
        {selected ? <RfiEditor rfi={selected} /> : null}
      </div>
    </QueryState>
  );
}

function RfiEditor({ rfi }: { rfi: Rfi }) {
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const form = useForm<{ question: string; reason: string }>({
    resolver: zodResolver(rfiSchema),
    values: { question: rfi.question, reason: rfi.reason },
  });
  const question = useWatch({ control: form.control, name: "question" });
  const save = useMutation({
    mutationFn: (values: { question: string; reason: string }) =>
      rfisApi.save(rfi.id, values, role),
    onSuccess: async () => {
      toast.success("Draft saved for review.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });
  const send = useMutation({
    mutationFn: () => rfisApi.send(rfi.id, role),
    onSuccess: async () => {
      toast.success("Send simulated. No email left this browser.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not send."),
  });
  const draftReason = denialReason(role, "draft_rfi");
  const sendReason = denialReason(role, "send_rfi");

  return (
    <section className="border-line bg-surface grid gap-3 border p-4">
      <h2 className="text-sm font-semibold">{rfi.number}</h2>
      {rfi.aiDrafted ? (
        <p className="text-muted text-xs">
          AI drafted this question. It stays a draft until a person sends it.
        </p>
      ) : null}
      <SourceReference source={rfi.source} />
      <p className="text-muted text-xs">Due {formatDateTime(rfi.dueAt)}</p>
      <form
        className="grid gap-3"
        onSubmit={form.handleSubmit((values) => save.mutate(values))}
      >
        <Field
          label="Question"
          htmlFor="rfi-question"
          error={form.formState.errors.question?.message}
        >
          <Textarea id="rfi-question" {...form.register("question")} />
        </Field>
        <Field
          label="Reason"
          htmlFor="rfi-reason"
          error={form.formState.errors.reason?.message}
        >
          <Textarea id="rfi-reason" {...form.register("reason")} />
        </Field>
        {draftReason ? <p className="text-muted text-sm">{draftReason}</p> : null}
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="secondary"
            disabled={Boolean(draftReason) || save.isPending}
          >
            Save draft
          </Button>
          <Button
            type="button"
            disabled={Boolean(sendReason) || rfi.status === "draft" || send.isPending}
            onClick={() => send.mutate()}
          >
            Send (simulated)
          </Button>
        </div>
      </form>
      <div className="border-line bg-surface-muted border border-dashed p-3 text-sm">
        <p className="text-muted text-xs font-medium tracking-wide uppercase">
          Email preview
        </p>
        <p className="mt-2">To: project GC contact</p>
        <p>Subject: {rfi.number}</p>
        <p className="mt-2">{question}</p>
        <p className="text-muted mt-2 text-xs">Simulated preview. Nothing is emailed.</p>
      </div>
    </section>
  );
}
