import { Suspense, type ReactNode } from "react";

import { LoadingState } from "@/components/feedback/query-state";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingState label="Loading Northline" />
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
