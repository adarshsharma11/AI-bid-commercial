"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { QueryState } from "@/components/feedback/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { quotesApi, workspaceApi } from "@/lib/api";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrencyExact } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { Quote } from "@/types/domain";

export function QuotesPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const [compare, setCompare] = useState<string[]>([]);
  const [open, setOpen] = useState<Quote | null>(null);
  const quotes = useQuery({
    queryKey: queryKeys.quotes.list(projectId),
    queryFn: ({ signal }) => quotesApi.list(projectId, signal),
  });
  const subs = useQuery({
    queryKey: queryKeys.subcontractors.list(""),
    queryFn: ({ signal }) => workspaceApi.reference(signal),
  });
  const select = useMutation({
    mutationFn: (quoteId: string) => quotesApi.select(quoteId, role),
    onSuccess: async () => {
      toast.success("Construction Lead selection saved in this demo.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Selection failed."),
  });
  const nameFor = (id: string) =>
    subs.data?.subcontractors.find((item) => item.id === id)?.name ?? "Subcontractor";
  const reason = denialReason(role, "select_subcontractor");
  const chosen =
    quotes.data?.filter((quote) => compare.includes(quote.id)).slice(0, 2) ?? [];

  function toggle(id: string) {
    setCompare((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id].slice(-2);
    });
  }

  return (
    <QueryState
      isPending={quotes.isPending}
      isFetching={quotes.isFetching && !quotes.isPending}
      isError={quotes.isError}
      error={quotes.error}
      onRetry={() => void quotes.refetch()}
      pendingLabel="Loading quotes"
      skeleton={<SkeletonTable label="Loading quotes" />}
    >
      <p className="text-muted text-sm">
        Lowest price is not selected automatically. The Construction Lead chooses the
        subcontractor.
      </p>
      <div className="border-line bg-surface overflow-x-auto border">
        <table className="w-full min-w-[880px] text-left text-sm">
          <caption className="sr-only">Subcontractor quotes</caption>
          <thead className="border-line text-muted border-b text-xs uppercase">
            <tr>
              <th className="px-3 py-2">Compare</th>
              <th className="px-3 py-2">Subcontractor</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Missing scope</th>
              <th className="px-3 py-2">Insurance</th>
              <th className="px-3 py-2">Valid</th>
              <th className="px-3 py-2">Decision</th>
            </tr>
          </thead>
          <tbody>
            {quotes.data?.map((quote) => (
              <tr
                key={quote.id}
                className="border-line hover:bg-surface-muted border-b last:border-0"
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label={`Compare ${nameFor(quote.subcontractorId)}`}
                    checked={compare.includes(quote.id)}
                    onChange={() => toggle(quote.id)}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="font-medium hover:underline"
                    onClick={() => setOpen(quote)}
                  >
                    {nameFor(quote.subcontractorId)}
                  </button>
                  {quote.selected ? (
                    <Badge className="ml-2" tone="success">
                      Selected
                    </Badge>
                  ) : null}
                </td>
                <td className="px-3 py-2">{formatCurrencyExact(quote.amount)}</td>
                <td className="px-3 py-2">
                  {quote.missingScope.join(", ") || "None listed"}
                </td>
                <td className="px-3 py-2 capitalize">{quote.insuranceStatus}</td>
                <td className="px-3 py-2">{formatDate(quote.validUntil)}</td>
                <td className="px-3 py-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    pending={select.isPending && select.variables === quote.id}
                    disabled={Boolean(reason) || select.isPending}
                    onClick={() => select.mutate(quote.id)}
                  >
                    Select
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reason ? <p className="text-muted text-sm">{reason}</p> : null}
      {chosen.length === 2 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {chosen.map((quote) => (
            <article key={quote.id} className="border-line bg-surface border p-3">
              <h2 className="text-sm font-semibold">{nameFor(quote.subcontractorId)}</h2>
              <p className="mt-1 text-lg tabular-nums">
                {formatCurrencyExact(quote.amount)}
              </p>
              <p className="mt-2 text-sm">Includes: {quote.inclusions.join(", ")}</p>
              <p className="text-sm">Excludes: {quote.exclusions.join(", ")}</p>
              <p className="text-muted mt-2 text-sm">{quote.notes}</p>
              {quote.riskFlags.length > 0 ? (
                <ul className="text-danger mt-2 text-sm">
                  {quote.riskFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm">
          Select two quotes to compare them side by side.
        </p>
      )}
      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent>
          {open ? (
            <>
              <DialogTitle>{nameFor(open.subcontractorId)}</DialogTitle>
              <DialogDescription>
                {formatCurrencyExact(open.amount)} · valid {formatDate(open.validUntil)}
              </DialogDescription>
              <p className="mt-3 text-sm">{open.notes}</p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </QueryState>
  );
}
