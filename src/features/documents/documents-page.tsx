"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { QueryState } from "@/components/feedback/query-state";
import { DocumentListSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { documentsApi } from "@/lib/api";
import { DOCUMENT_TYPE_LABEL, REVIEW_STATUS_LABEL } from "@/lib/constants/labels";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/utils/dates";
import { DOCUMENT_TYPES, type Document, type DocumentType } from "@/types/domain";

export function DocumentsPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<DocumentType | "all">("all");
  const [selected, setSelected] = useState<Document | null>(null);
  const documents = useQuery({
    queryKey: queryKeys.documents.list(projectId),
    queryFn: ({ signal }) => documentsApi.list(projectId, signal),
  });
  const review = useMutation({
    mutationFn: (document: Document) =>
      documentsApi.updateReview(document.id, "reviewed", role),
    onSuccess: async () => {
      toast.success("Marked reviewed in this demo.");
      await refresh();
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Could not update the document.",
      ),
  });
  const rows = useMemo(
    () =>
      (documents.data ?? []).filter((document) => {
        const matchesType = type === "all" || document.type === type;
        const matchesSearch = `${document.name} ${document.filename}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesType && matchesSearch;
      }),
    [documents.data, search, type],
  );
  const queue = (documents.data ?? []).filter(
    (document) => document.changed || document.type === "addendum",
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Input
          aria-label="Search documents"
          placeholder="Search documents"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Select
          aria-label="Document type"
          value={type}
          onChange={(event) => setType(event.target.value as DocumentType | "all")}
        >
          <option value="all">All types</option>
          {DOCUMENT_TYPES.map((item) => (
            <option key={item} value={item}>
              {DOCUMENT_TYPE_LABEL[item]}
            </option>
          ))}
        </Select>
      </div>
      {queue.length > 0 ? (
        <p className="text-muted text-sm">
          Addendum review queue:{" "}
          {queue.filter((document) => document.reviewStatus !== "reviewed").length} still
          open.
        </p>
      ) : null}
      <QueryState
        isPending={documents.isPending}
        isFetching={documents.isFetching}
        pendingLabel="Loading documents"
        skeleton={<DocumentListSkeleton />}
        isError={documents.isError}
        error={documents.error}
        onRetry={() => void documents.refetch()}
        isEmpty={!documents.isPending && rows.length === 0}
        emptyTitle="No documents"
        emptyDescription="Nothing matches this search."
      >
        <div className="border-line bg-surface overflow-x-auto border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">Project documents</caption>
            <thead className="border-line text-muted border-b text-xs uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Version</th>
                <th className="px-3 py-2 font-medium">Revised</th>
                <th className="px-3 py-2 font-medium">Received</th>
                <th className="px-3 py-2 font-medium">Review</th>
                <th className="px-3 py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((document) => (
                <tr
                  key={document.id}
                  className="border-line hover:bg-surface-muted border-b last:border-0"
                >
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="font-medium hover:underline"
                      onClick={() => setSelected(document)}
                    >
                      {document.name}
                    </button>
                    {document.changed ? (
                      <span className="text-warning ml-2 text-xs">Changed</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{DOCUMENT_TYPE_LABEL[document.type]}</td>
                  <td className="px-3 py-2">{document.version}</td>
                  <td className="px-3 py-2">{formatDate(document.revisionDate)}</td>
                  <td className="px-3 py-2">{formatDate(document.receivedAt)}</td>
                  <td className="px-3 py-2">
                    {REVIEW_STATUS_LABEL[document.reviewStatus]}
                  </td>
                  <td className="px-3 py-2">{document.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent side="right" className="p-0">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="border-line border-b px-5 py-4 pr-12">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.filename}
                  {selected.addendumNumber
                    ? ` · Addendum ${selected.addendumNumber}`
                    : ""}
                </DialogDescription>
              </div>
              <div className="grid flex-1 gap-4 overflow-y-auto p-5">
                <div className="border-line bg-surface-muted flex min-h-72 items-center justify-center border border-dashed p-6 text-center">
                  <div>
                    <p className="text-sm font-medium">Sample preview</p>
                    <p className="text-muted mt-2 max-w-sm text-sm">
                      This is not a measured drawing and no OCR was run. Page count on
                      file: {selected.pageCount ?? "unknown"}.
                    </p>
                  </div>
                </div>
                <p className="text-sm">{selected.notes ?? "No reviewer note."}</p>
                <p className="text-muted text-sm">
                  {denialReason(role, "review_documents")}
                </p>
                <Button
                  disabled={
                    Boolean(denialReason(role, "review_documents")) || review.isPending
                  }
                  onClick={() => review.mutate(selected)}
                >
                  Mark reviewed
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
