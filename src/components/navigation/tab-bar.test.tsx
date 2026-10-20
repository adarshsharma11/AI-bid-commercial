import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { TabBar } from "@/components/navigation/tab-bar";

function Harness() {
  const [active, setActive] = useState("company");
  return (
    <TabBar
      label="Settings"
      activeId={active}
      onSelect={setActive}
      tabs={[
        { id: "company", label: "Company" },
        { id: "team", label: "Team & Roles" },
      ]}
    />
  );
}

describe("settings tab bar", () => {
  it("moves selection with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const company = screen.getByRole("tab", { name: "Company" });
    expect(company).toHaveAttribute("aria-selected", "true");
    company.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Team & Roles" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
