import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useParams: () => ({ projectId: "prj_gulch" }),
  usePathname: () => "/pipeline",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { TooltipProvider } from "@/components/ui/tooltip";
import { PipelinePage } from "@/features/pipeline/pipeline-page";
import { QuotesPage } from "@/features/quotes/quotes-page";
import { RoleProvider } from "@/hooks/use-role";

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <RoleProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}

describe("pipeline filters and project form", () => {
  it("filters the pipeline to pricing work and validates a new project", async () => {
    const user = userEvent.setup();
    render(<PipelinePage />, { wrapper: Wrapper });
    expect(
      await screen.findByRole("link", { name: "The Gulch Office Tower" }),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Status"), "pricing");
    expect(
      await screen.findByRole("link", { name: "The Gulch Office Tower" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Franklin Civic Center" }),
    ).not.toBeInTheDocument();
    const projectHeader = screen.getByRole("columnheader", { name: /Project/ });
    await user.click(within(projectHeader).getByRole("button"));
    expect(projectHeader).toHaveAttribute(
      "aria-sort",
      expect.stringMatching(/ascending|descending/),
    );

    await user.click(screen.getByRole("button", { name: "New project" }));
    await user.click(screen.getByRole("button", { name: "Add project" }));
    expect(await screen.findByText("Enter a project name.")).toBeInTheDocument();
  });
});

describe("quote comparison", () => {
  it("shows two quotes and does not call the lowest price the winner", async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    render(<QuotesPage />, { wrapper: Wrapper });
    expect(
      await screen.findByText(/lowest price is not selected automatically/i),
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText("Compare Midstate Painters"));
    await user.click(screen.getByLabelText("Compare Volunteer Finishes"));
    expect(screen.getAllByText("$241,500.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$298,750.00").length).toBeGreaterThan(0);
  });
});
