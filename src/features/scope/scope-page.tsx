"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SourceReference } from "@/components/data-display/indicators";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { QueryState } from "@/components/feedback/query-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { scopeApi } from "@/lib/api";
import { SCOPE_STATUS_LABEL } from "@/lib/constants/labels";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { scopeItemSchema } from "@/types/schemas";
import { SCOPE_STATUSES, type ScopeItem, type ScopeStatus } from "@/types/domain";

export function ScopePage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const [editing, setEditing] = useState<ScopeItem | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const scope = useQuery({
    queryKey: queryKeys.scope.list(projectId),
    queryFn: ({ signal }) => scopeApi.list(projectId, signal),
  });
  const approve = useMutation({
    mutationFn: (id: string) => scopeApi.approve(id, role),
    onSuccess: async () => {
      setApproveId(null);
      toast.success("Scope item approved in this demo.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Approval failed."),
  });

  return (
    <QueryState
      isPending={scope.isPending}
      isError={scope.isError}
      error={scope.error}
      onRetry={() => void scope.refetch()}
    >
      <ul className="divide-line border-line bg-surface divide-y border">
        {scope.data?.map((item) => (
          <li key={item.id} className="grid gap-2 px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{item.requirement}</h2>
              <div className="flex gap-2">
                <Badge tone="neutral">{SCOPE_STATUS_LABEL[item.status]}</Badge>
                <Badge tone={item.approval === "approved" ? "success" : "warning"}>
                  {item.approval}
                </Badge>
              </div>
            </div>
            <p className="text-sm">
              <span className="font-medium">AI finding. </span>
              {item.aiFinding}
            </p>
            <SourceReference source={item.source} />
            {item.riskNote ? (
              <p className="text-muted text-sm">Risk: {item.riskNote}</p>
            ) : null}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(item)}>
                Inspect
              </Button>
              <Button
                size="sm"
                disabled={
                  Boolean(denialReason(role, "approve_scope")) ||
                  item.approval === "approved"
                }
                onClick={() => setApproveId(item.id)}
              >
                Approve
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {editing ? (
        <ScopeEditor
          item={editing}
          onClose={() => setEditing(null)}
          roleDenied={denialReason(role, "edit_scope")}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(approveId)}
        onOpenChange={(open) => !open && setApproveId(null)}
        title="Approve this scope item?"
        description="This records a human review in the demo. It does not change the AI finding into a decision by itself."
        confirmLabel="Approve scope item"
        pending={approve.isPending}
        onConfirm={() => approveId && approve.mutate(approveId)}
      />
    </QueryState>
  );
}

function ScopeEditor({
  item,
  onClose,
  roleDenied,
}: {
  item: ScopeItem;
  onClose: () => void;
  roleDenied: string | null;
}) {
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const form = useForm<{ status: ScopeStatus; riskNote: string; aiFinding: string }>({
    resolver: zodResolver(scopeItemSchema),
    defaultValues: {
      status: item.status,
      riskNote: item.riskNote ?? "",
      aiFinding: item.aiFinding,
    },
  });
  const save = useMutation({
    mutationFn: (values: { status: ScopeStatus; riskNote: string; aiFinding: string }) =>
      scopeApi.update(item.id, { ...values, riskNote: values.riskNote || null }, role),
    onSuccess: async () => {
      toast.success("Scope draft updated.");
      await refresh();
      onClose();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle>{item.requirement}</DialogTitle>
        <form
          className="mt-4 grid gap-3"
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
        >
          <Field
            label="Review status"
            htmlFor="scope-status"
            error={form.formState.errors.status?.message}
          >
            <Select id="scope-status" {...form.register("status")}>
              {SCOPE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {SCOPE_STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Finding"
            htmlFor="scope-finding"
            error={form.formState.errors.aiFinding?.message}
          >
            <Textarea id="scope-finding" {...form.register("aiFinding")} />
          </Field>
          <Field
            label="Risk or clarification"
            htmlFor="scope-risk"
            error={form.formState.errors.riskNote?.message}
          >
            <Textarea id="scope-risk" {...form.register("riskNote")} />
          </Field>
          {roleDenied ? <p className="text-muted text-sm">{roleDenied}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={Boolean(roleDenied) || save.isPending}>
              Save review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
