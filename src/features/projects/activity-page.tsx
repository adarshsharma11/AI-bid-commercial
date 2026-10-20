"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { QueryState } from "@/components/feedback/query-state";
import { activityApi } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/utils/dates";

export function ActivityPage() {
  const projectId = useParams<{ projectId: string }>().projectId;
  const activity = useQuery({
    queryKey: queryKeys.activity.list(projectId),
    queryFn: ({ signal }) => activityApi.list(projectId, signal),
  });

  return (
    <QueryState
      isPending={activity.isPending}
      isError={activity.isError}
      error={activity.error}
      onRetry={() => void activity.refetch()}
      isEmpty={activity.data?.length === 0}
      emptyTitle="No activity"
      emptyDescription="Actions on this project will show up here."
    >
      <ol className="border-line grid gap-4 border-l pl-4">
        {activity.data?.map((event) => (
          <li key={event.id}>
            <p className="text-sm font-medium">{event.action}</p>
            <p className="text-muted text-xs">
              {formatDateTime(event.at)} ·{" "}
              {event.actorRole === "system" ? "System" : ROLE_LABEL[event.actorRole]}
            </p>
            <p className="mt-1 text-sm">{event.detail}</p>
          </li>
        ))}
      </ol>
    </QueryState>
  );
}
