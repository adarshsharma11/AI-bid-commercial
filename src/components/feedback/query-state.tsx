import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeleton";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-line bg-surface flex flex-col items-start gap-3 border border-dashed px-4 py-8">
      <Inbox className="text-muted h-5 w-5" aria-hidden />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-muted mt-1 max-w-lg text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function LoadingState({
  label = "Loading",
  skeleton,
}: {
  label?: string;
  skeleton?: ReactNode;
}) {
  return skeleton ?? <PageSkeleton label={label} />;
}

export function ErrorState({
  title = "This did not load",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="border-danger/30 bg-danger-bg border px-4 py-4" role="alert">
      <h3 className="text-danger text-sm font-semibold">{title}</h3>
      <p className="text-ink mt-1 text-sm">{message}</p>
      {onRetry ? (
        <Button className="mt-3" variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function QueryState({
  isPending,
  isFetching = false,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyDescription,
  pendingLabel = "Loading",
  skeleton,
  children,
}: {
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  error: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pendingLabel?: string;
  skeleton?: ReactNode;
  children: ReactNode;
}) {
  if (isPending) {
    return <LoadingState label={pendingLabel} skeleton={skeleton} />;
  }
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Something went wrong."}
        onRetry={onRetry}
      />
    );
  }
  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle ?? "Nothing here"}
        description={emptyDescription ?? "There is nothing to show for this view."}
      />
    );
  }
  return (
    <div className="relative">
      {isFetching ? (
        <div
          className="bg-accent absolute inset-x-0 top-0 z-10 h-0.5"
          role="progressbar"
          aria-label="Refreshing"
        />
      ) : null}
      {children}
    </div>
  );
}
