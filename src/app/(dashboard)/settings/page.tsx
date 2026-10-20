import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/query-state";
import { SettingsPage } from "@/features/settings/settings-page";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Loading settings" />}>
      <SettingsPage />
    </Suspense>
  );
}
