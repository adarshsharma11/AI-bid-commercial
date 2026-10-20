import type { ReactNode } from "react";

import { ProjectFrame } from "@/features/projects/project-frame";

export default function Layout({ children }: { children: ReactNode }) {
  return <ProjectFrame>{children}</ProjectFrame>;
}
