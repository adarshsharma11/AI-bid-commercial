"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { QueryState } from "@/components/feedback/query-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { estimatesApi } from "@/lib/api";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrencyExact } from "@/lib/utils/currency";
import { calculateEstimate, lineTotal } from "@/lib/utils/estimate";
import type { Estimate, EstimateLine } from "@/types/domain";

export function EstimatePage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const estimate = useQuery({
    queryKey: queryKeys.estimates.detail(projectId),
    queryFn: ({ signal }) => estimatesApi.get(projectId, signal),
  });
  const [price, setPrice] = useState("");
  const server = estimate.data ?? null;
  const [edited, setEdited] = useState<{ base: Estimate; draft: Estimate } | null>(null);
  const draft = server && edited?.base === server ? edited.draft : server;

  function setDraft(next: Estimate | ((current: Estimate) => Estimate)) {
    if (!server) return;
    const current = edited?.base === server ? edited.draft : server;
    const resolved = typeof next === "function" ? next(current) : next;
    setEdited({ base: server, draft: resolved });
  }

  const save = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error("Nothing to save.");
      return estimatesApi.update(projectId, draft, role);
    },
    onSuccess: async () => {
      toast.success("Estimate draft saved. The official bid price did not change.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });
  const setBid = useMutation({
    mutationFn: () => estimatesApi.setBidPrice(projectId, Number(price), role),
    onSuccess: async () => {
      toast.success("Official bid price set by the Construction Lead.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not set the price."),
  });

  const totals = draft
    ? calculateEstimate(draft.lines, draft.markupPercent, draft.contingencyPercent)
    : null;
  const editReason = denialReason(role, "edit_estimate");
  const priceReason = denialReason(role, "set_bid_price");

  return (
    <QueryState
      isPending={estimate.isPending}
      isError={estimate.isError}
      error={estimate.error}
      onRetry={() => void estimate.refetch()}
    >
      {draft && totals ? (
        <div className="grid gap-4">
          <p className="text-muted text-sm">
            Official bid price: {formatCurrencyExact(draft.bidPrice)}. Editing lines does
            not change it.
          </p>
          <div className="border-line bg-surface overflow-x-auto border">
            <table className="w-full min-w-[860px] text-left text-sm">
              <caption className="sr-only">Estimate lines</caption>
              <thead className="border-line text-muted border-b text-xs uppercase">
                <tr>
                  <th className="px-3 py-2">Scope</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Material</th>
                  <th className="px-3 py-2">Labor</th>
                  <th className="px-3 py-2">Sub</th>
                  <th className="px-3 py-2">Other</th>
                  <th className="px-3 py-2">Line total</th>
                </tr>
              </thead>
              <tbody>
                {draft.lines.map((line, index) => (
                  <tr key={line.id} className="border-line border-b">
                    <td className="px-3 py-2">{line.description}</td>
                    <NumberCell
                      line={line}
                      index={index}
                      field="quantity"
                      onChange={updateLine}
                    />
                    <NumberCell
                      line={line}
                      index={index}
                      field="materialCost"
                      onChange={updateLine}
                    />
                    <NumberCell
                      line={line}
                      index={index}
                      field="laborCost"
                      onChange={updateLine}
                    />
                    <NumberCell
                      line={line}
                      index={index}
                      field="subcontractorCost"
                      onChange={updateLine}
                    />
                    <NumberCell
                      line={line}
                      index={index}
                      field="otherCost"
                      onChange={updateLine}
                    />
                    <td className="px-3 py-2 tabular-nums">
                      {formatCurrencyExact(lineTotal(line))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Markup %
              <Input
                className="mt-1"
                type="number"
                value={draft.markupPercent}
                onChange={(event) =>
                  setDraft({ ...draft, markupPercent: Number(event.target.value) })
                }
              />
            </label>
            <label className="text-sm">
              Contingency %
              <Input
                className="mt-1"
                type="number"
                value={draft.contingencyPercent}
                onChange={(event) =>
                  setDraft({ ...draft, contingencyPercent: Number(event.target.value) })
                }
              />
            </label>
          </div>
          <dl className="grid max-w-sm gap-1 text-sm">
            <Row label="Direct cost" value={totals.direct} />
            <Row label="Markup" value={totals.markup} />
            <Row label="Subtotal" value={totals.subtotal} />
            <Row label="Contingency" value={totals.contingency} />
            <Row label="Calculated total" value={totals.total} />
          </dl>
          <div>
            <h2 className="text-sm font-semibold">Assumptions</h2>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {draft.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2 className="mt-3 text-sm font-semibold">Exclusions</h2>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {draft.exclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          {editReason ? <p className="text-muted text-sm">{editReason}</p> : null}
          <div>
            <Button
              disabled={Boolean(editReason) || save.isPending}
              onClick={() => save.mutate()}
            >
              Save draft lines
            </Button>
          </div>
          <section className="border-line grid max-w-md gap-2 border-t pt-4">
            <h2 className="text-sm font-semibold">Set official bid price</h2>
            <p className="text-muted text-sm">
              Calculated total is {formatCurrencyExact(totals.total)}. Setting a price
              clears proposal approvals.
            </p>
            <Input
              aria-label="Official bid price"
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            {priceReason ? <p className="text-muted text-sm">{priceReason}</p> : null}
            <Button
              variant="secondary"
              disabled={Boolean(priceReason) || !price || setBid.isPending}
              onClick={() => setBid.mutate()}
            >
              Set bid price
            </Button>
          </section>
        </div>
      ) : null}
    </QueryState>
  );

  function updateLine(index: number, field: keyof EstimateLine, value: number) {
    setDraft((current) => {
      const lines = current.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: value } : line,
      );
      return { ...current, lines };
    });
  }
}

function NumberCell({
  line,
  field,
  onChange,
  index,
}: {
  line: EstimateLine;
  field: "quantity" | "materialCost" | "laborCost" | "subcontractorCost" | "otherCost";
  index: number;
  onChange: (
    index: number,
    field: "quantity" | "materialCost" | "laborCost" | "subcontractorCost" | "otherCost",
    value: number,
  ) => void;
}) {
  return (
    <td className="px-3 py-2">
      <Input
        aria-label={`${line.description} ${field}`}
        className="w-24"
        type="number"
        value={line[field]}
        onChange={(event) => onChange(index, field, Number(event.target.value))}
      />
    </td>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatCurrencyExact(value)}</dd>
    </div>
  );
}
