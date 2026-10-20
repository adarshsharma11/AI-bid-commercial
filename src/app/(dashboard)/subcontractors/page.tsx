import type { Metadata } from "next";

import { DirectoryPage } from "@/features/directories/directory-page";

export const metadata: Metadata = { title: "Subcontractors" };

export default function Page() {
  return <DirectoryPage kind="subcontractors" />;
}
