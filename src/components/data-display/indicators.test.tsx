import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApprovalStatus, DeadlineIndicator } from "@/components/data-display/indicators";
import { ProjectStatusBadge } from "@/components/data-display/status-badge";
import { ErrorState, LoadingState } from "@/components/feedback/query-state";
import { chicagoDateTime } from "@/lib/utils/dates";

describe("status and deadline display", () => {
  it("labels a project status in text", () => {
    render(<ProjectStatusBadge status="pricing" />);
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });

  it("labels an overdue deadline without relying on color alone", () => {
    const now = new Date("2026-10-21T15:00:00.000Z");
    render(<DeadlineIndicator iso={chicagoDateTime(now, -2, 15)} now={now} />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("shows which proposal approvals are still pending", () => {
    render(
      <ApprovalStatus
        slots={[
          { label: "Precon / Design Lead", approved: true },
          { label: "Construction Lead", approved: false },
        ]}
      />,
    );
    expect(screen.getByText("Waiting on approval")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });
});

describe("loading and error states", () => {
  it("exposes a retry action", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <div>
        <LoadingState label="Loading pipeline" />
        <ErrorState message="The pipeline failed." onRetry={onRetry} />
      </div>,
    );
    expect(screen.getByText("Loading pipeline")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
