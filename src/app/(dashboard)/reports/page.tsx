import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/query-state";
import { ReportsPage } from "@/features/reports/reports-page";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Loading reports" />}>
      <ReportsPage />
    </Suspense>
  );
}
