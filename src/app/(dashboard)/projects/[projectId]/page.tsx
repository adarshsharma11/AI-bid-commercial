import type { Metadata } from "next";

import { OverviewPage } from "@/features/projects/overview-page";

export const metadata: Metadata = { title: "Project" };

export default function Page() {
  return <OverviewPage />;
}
