import { AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { deadlineLabel, classifyDeadline, type DeadlineTone } from "@/lib/utils/deadline";
import { formatDateTime } from "@/lib/utils/dates";

const TONE: Record<DeadlineTone, "danger" | "warning" | "accent" | "neutral"> = {
  overdue: "danger",
  today: "warning",
  soon: "accent",
  upcoming: "neutral",
  none: "neutral",
};

export function DeadlineIndicator({
  iso,
  now = new Date(),
}: {
  iso: string | null;
  now?: Date;
}) {
  const tone = classifyDeadline(iso, now);
  const Icon =
    tone === "overdue" ? AlertTriangle : tone === "none" ? CheckCircle2 : CalendarClock;
  return (
    <span className="inline-flex items-center gap-2">
      <Badge tone={TONE[tone]}>
        <Icon className="h-3 w-3" aria-hidden />
        {deadlineLabel(tone)}
      </Badge>
      <span className="text-muted text-xs">{formatDateTime(iso)}</span>
    </span>
  );
}

export function ApprovalStatus({
  slots,
}: {
  slots: { label: string; approved: boolean; detail?: string }[];
}) {
  const complete = slots.every((slot) => slot.approved);
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">
        {complete ? "Approved by every required lead" : "Waiting on approval"}
      </p>
      <ul className="grid gap-1">
        {slots.map((slot) => (
          <li
            key={slot.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span>{slot.label}</span>
            <Badge tone={slot.approved ? "success" : "warning"}>
              {slot.approved ? "Approved" : "Pending"}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SourceReference({
  source,
}: {
  source: {
    filename: string;
    page: number | null;
    sheet: string | null;
    revision: string | null;
  } | null;
}) {
  if (!source) return <span className="text-muted text-sm">No source cited</span>;
  const parts = [
    source.filename,
    source.sheet ? `Sheet ${source.sheet}` : null,
    source.page != null ? `p. ${source.page}` : null,
    source.revision,
  ].filter(Boolean);
  return <span className="text-ink text-sm">{parts.join(" · ")}</span>;
}

export function ConfidenceIndicator({ value }: { value: number }) {
  const percent = Math.round(value * 100);
  return (
    <span className="text-muted inline-flex items-center gap-2 text-xs">
      <span className="bg-line h-1.5 w-16">
        <span className="bg-accent block h-1.5" style={{ width: `${percent}%` }} />
      </span>
      <span>{percent}% sample confidence</span>
    </span>
  );
}

export function InlineMetadata({ items }: { items: string[] }) {
  return <p className="text-muted text-xs">{items.filter(Boolean).join(" · ")}</p>;
}
