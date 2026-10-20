import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABEL } from "@/lib/constants/labels";
import type { ProjectStatus } from "@/types/domain";

const TONE: Record<
  ProjectStatus,
  "neutral" | "info" | "success" | "warning" | "danger" | "accent"
> = {
  new: "info",
  screening: "warning",
  go: "success",
  reviewing: "accent",
  pricing: "accent",
  submitted: "info",
  won: "success",
  lost: "danger",
  no_go: "neutral",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={TONE[status]}>{PROJECT_STATUS_LABEL[status]}</Badge>;
}

export function PriorityBadge({ level }: { level: "high" | "normal" | "low" }) {
  const label = level === "high" ? "High" : level === "low" ? "Low" : "Normal";
  const tone = level === "high" ? "danger" : level === "low" ? "neutral" : "warning";
  return <Badge tone={tone}>{label} priority</Badge>;
}
