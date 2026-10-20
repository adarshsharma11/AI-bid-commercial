import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/query-state";
import { InboxPage } from "@/features/inbox/inbox-page";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Loading inbox" />}>
      <InboxPage />
    </Suspense>
  );
}
