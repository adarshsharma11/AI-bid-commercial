import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { SettingsPage } from "@/features/settings/settings-page";

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("settings tabs and validation", () => {
  it("keeps an unsaved company name when switching tabs and validates on save", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />, { wrapper: Wrapper });
    const name = await screen.findByLabelText("Name", { selector: "#ws-name" });
    await user.clear(name);
    await user.type(name, "A");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Team & Roles" }));
    expect(screen.getByRole("heading", { name: "Team" })).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Company" }));
    expect(screen.getByLabelText("Name", { selector: "#ws-name" })).toHaveValue("A");
    await user.click(screen.getByRole("button", { name: "Save company" }));
    expect(await screen.findByText("Enter a workspace name.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save company" })).toBeEnabled();
  });
});
