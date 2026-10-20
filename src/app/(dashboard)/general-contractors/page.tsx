import type { Metadata } from "next";

import { DirectoryPage } from "@/features/directories/directory-page";

export const metadata: Metadata = { title: "General contractors" };

export default function Page() {
  return <DirectoryPage kind="general-contractors" />;
}
