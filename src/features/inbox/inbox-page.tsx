"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { QueryState } from "@/components/feedback/query-state";
import { DocumentListSkeleton } from "@/components/ui/skeleton";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { inboxApi, projectsApi } from "@/lib/api";
import { INBOX_TYPE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/utils/dates";
import type { InboxType } from "@/types/domain";

const TYPES = [
  "all",
  "invitation",
  "addendum",
  "quote",
  "rfi_response",
  "unmatched",
] as const;

export function InboxPage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const refresh = useRefreshWorkspace();
  const inbox = useQuery({
    queryKey: queryKeys.inbox.list(type),
    queryFn: ({ signal }) => inboxApi.list(type, signal),
    placeholderData: (previous) => previous,
  });
  const projects = useQuery({
    queryKey: queryKeys.projects.list({ page: 1, pageSize: 50 }),
    queryFn: ({ signal }) => projectsApi.list({ page: 1, pageSize: 50 }, signal),
  });
  const review = useMutation({
    mutationFn: (id: string) => inboxApi.review(id),
    onSuccess: () => refresh(),
  });
  const match = useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      inboxApi.match(id, projectId),
    onSuccess: async () => {
      toast.success("Matched in this demo. No external message was sent.");
      await refresh();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not match."),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Inbox"
        description="Invitations, addenda, quotes, and replies waiting to be reviewed. Matching is simulated."
      />
      <Select
        aria-label="Inbox type"
        className="max-w-xs"
        value={type}
        onChange={(event) => setType(event.target.value as InboxType | "all")}
      >
        {TYPES.map((item) => (
          <option key={item} value={item}>
            {item === "all" ? "All types" : INBOX_TYPE_LABEL[item]}
          </option>
        ))}
      </Select>
      <QueryState
        isPending={inbox.isPending}
        isFetching={inbox.isFetching}
        pendingLabel="Loading inbox"
        skeleton={<DocumentListSkeleton label="Loading inbox" />}
        isError={inbox.isError}
        error={inbox.error}
        onRetry={() => void inbox.refetch()}
        isEmpty={inbox.data?.length === 0}
        emptyTitle="Inbox is clear"
        emptyDescription="No items match this filter."
      >
        <ul className="divide-line border-line bg-surface divide-y border">
          {inbox.data?.map((item) => (
            <li key={item.id} className="grid gap-2 px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={item.read ? "neutral" : "accent"}>
                  {item.read ? "Reviewed" : "Unread"}
                </Badge>
                <span className="text-muted text-xs">
                  {INBOX_TYPE_LABEL[item.type] ?? item.type}
                </span>
                <span className="text-muted text-xs">
                  {formatDateTime(item.receivedAt)}
                </span>
              </div>
              <h2 className="text-sm font-semibold">{item.title}</h2>
              <p className="text-sm">{item.summary}</p>
              <div className="flex flex-wrap items-center gap-2">
                {item.projectId ? (
                  <Link
                    href={`/projects/${item.projectId}`}
                    className="text-accent text-sm hover:underline"
                  >
                    Open project
                  </Link>
                ) : (
                  <Select
                    aria-label={`Match ${item.title}`}
                    defaultValue={item.suggestedProjectId ?? ""}
                    onChange={(event) => {
                      if (event.target.value)
                        match.mutate({ id: item.id, projectId: event.target.value });
                    }}
                  >
                    <option value="">Match to a project</option>
                    {projects.data?.items.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => review.mutate(item.id)}
                >
                  Mark reviewed
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </QueryState>
    </PageContainer>
  );
}
