"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  ConfidenceIndicator,
  SourceReference,
} from "@/components/data-display/indicators";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { QueryState } from "@/components/feedback/query-state";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { takeoffsApi } from "@/lib/api";
import { TAKEOFF_CATEGORY_LABEL } from "@/lib/constants/labels";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import {
  TAKEOFF_CATEGORIES,
  type TakeoffCategory,
  type TakeoffItem,
} from "@/types/domain";

export function TakeoffPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const [category, setCategory] = useState<TakeoffCategory | "all">("all");
  const [sheet, setSheet] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const takeoff = useQuery({
    queryKey: queryKeys.takeoffs.list(projectId),
    queryFn: ({ signal }) => takeoffsApi.list(projectId, signal),
  });
  const approve = useMutation({
    mutationFn: () => takeoffsApi.approve(projectId, role),
    onSuccess: async () => {
      setConfirm(false);
      toast.success("Takeoff approved by the Precon Lead in this demo.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Approval failed."),
  });
  const rows = (takeoff.data ?? []).filter(
    (item) => category === "all" || item.category === category,
  );
  const sheets = ["A-101", "A-201", "A-601"];
  const reason = denialReason(role, "approve_takeoff");
  const approved = takeoff.data?.every((item) => item.approval === "approved");

  return (
    <QueryState
      isPending={takeoff.isPending}
      isError={takeoff.isError}
      error={takeoff.error}
      onRetry={() => void takeoff.refetch()}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_18rem]">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Select
              aria-label="Takeoff category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as TakeoffCategory | "all")
              }
              className="max-w-xs"
            >
              <option value="all">All categories</option>
              {TAKEOFF_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {TAKEOFF_CATEGORY_LABEL[item]}
                </option>
              ))}
            </Select>
            <Button
              disabled={Boolean(reason) || approved || approve.isPending}
              onClick={() => setConfirm(true)}
            >
              {approved ? "Takeoff approved" : "Approve takeoff"}
            </Button>
          </div>
          {reason ? <p className="text-muted text-sm">{reason}</p> : null}
          <p className="text-muted text-sm">
            Totals below use the sample quantities. They are not measurements from
            uploaded plans.
          </p>
          <div className="border-line bg-surface overflow-x-auto border">
            <table className="w-full min-w-[860px] text-left text-sm">
              <caption className="sr-only">Takeoff quantities</caption>
              <thead className="border-line text-muted border-b text-xs uppercase">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Finish</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <TakeoffRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="border-line bg-surface border p-3">
          <h2 className="text-sm font-semibold">Drawing preview</h2>
          <p className="text-muted mt-1 text-xs">
            Sample markup regions. Not a real overlay.
          </p>
          <div className="mt-3 flex gap-1">
            {sheets.map((name, index) => (
              <button
                key={name}
                type="button"
                className={`px-2 py-1 text-xs ${sheet === index ? "bg-accent text-white" : "bg-surface-muted"}`}
                onClick={() => setSheet(index)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="border-line bg-surface-muted relative mt-3 h-64 border border-dashed">
            <span className="border-accent/70 bg-accent/10 text-accent absolute top-3 left-3 h-16 w-24 border text-[10px]">
              Sample region
            </span>
            <span className="border-info/70 bg-info/10 text-info absolute right-6 bottom-8 h-12 w-20 border text-[10px]">
              {sheets[sheet]}
            </span>
          </div>
        </aside>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Approve this takeoff?"
        description="Approving records a human decision on the sample quantities. It does not certify a field measurement."
        confirmLabel="Approve takeoff"
        pending={approve.isPending}
        onConfirm={() => approve.mutate()}
      />
    </QueryState>
  );
}

function TakeoffRow({ item }: { item: TakeoffItem }) {
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const [quantity, setQuantity] = useState(String(item.quantity));
  const save = useMutation({
    mutationFn: () =>
      takeoffsApi.update(
        item.id,
        {
          quantity: Number(quantity),
          assumptions: item.assumptions,
          exclusions: item.exclusions,
        },
        role,
      ),
    onSuccess: async () => {
      toast.success("Quantity updated in demo data.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });
  const reason = denialReason(role, "edit_takeoff");

  return (
    <tr className="border-line border-b align-top last:border-0">
      <td className="px-3 py-2">
        <span className="font-medium">{item.item}</span>
        <span className="text-muted mt-1 block text-xs">
          {TAKEOFF_CATEGORY_LABEL[item.category]}
        </span>
        <span className="mt-1 block">
          <ConfidenceIndicator value={item.confidence} />
        </span>
      </td>
      <td className="px-3 py-2">{item.location}</td>
      <td className="px-3 py-2">
        <label className="text-muted grid gap-1 text-xs">
          {item.unit}
          <Input
            aria-label={`${item.item} quantity`}
            className="w-28"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
        <Button
          className="mt-2"
          size="sm"
          variant="secondary"
          disabled={Boolean(reason) || save.isPending}
          onClick={() => save.mutate()}
        >
          Save
        </Button>
        {reason ? <span className="text-muted mt-1 block text-xs">{reason}</span> : null}
      </td>
      <td className="px-3 py-2">{item.finish ?? "—"}</td>
      <td className="px-3 py-2">
        <SourceReference source={item.source} />
        <span className="text-muted mt-1 block text-xs">
          Scale {item.scale ?? "unknown"}
        </span>
        <span className="mt-1 block text-xs">{item.assumptions}</span>
      </td>
      <td className="px-3 py-2 capitalize">{item.approval}</td>
    </tr>
  );
}
