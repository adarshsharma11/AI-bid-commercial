import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/query-state";
import { PipelinePage } from "@/features/pipeline/pipeline-page";

export const metadata: Metadata = { title: "Bid pipeline" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Loading pipeline" />}>
      <PipelinePage />
    </Suspense>
  );
}
