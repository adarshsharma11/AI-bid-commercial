import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/query-state";
import { TodayPage } from "@/features/dashboard/today-page";

export const metadata: Metadata = { title: "Today" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Loading today" />}>
      <TodayPage />
    </Suspense>
  );
}
