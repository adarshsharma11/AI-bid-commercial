import { expect, test } from "@playwright/test";

test("loads today and opens a project", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await page
    .getByRole("link", { name: /The Gulch Office Tower/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "The Gulch Office Tower" }),
  ).toBeVisible();
});

test("filters the bid pipeline", async ({ page }) => {
  await page.goto("/pipeline");
  await page.getByLabel("Search pipeline").fill("Gulch");
  await expect(page.getByRole("link", { name: "The Gulch Office Tower" })).toBeVisible();
  await page.getByLabel("Status").selectOption("pricing");
  await expect(page.getByRole("link", { name: "Franklin Civic Center" })).toHaveCount(0);
});

test("inspects a document and a scope item", async ({ page }) => {
  await page.goto("/projects/prj_gulch/documents");
  await page.getByRole("button", { name: "Architectural floor plan" }).click();
  await expect(page.getByText("Sample preview")).toBeVisible();
  await page.goto("/projects/prj_gulch/scope");
  await expect(page.getByText("Interior gypsum wall paint, levels 2–8")).toBeVisible();
  await expect(page.getByText(/AI finding/).first()).toBeVisible();
});

test("edits and approves a demo takeoff as the precon lead", async ({ page }) => {
  await page.goto("/projects/prj_gulch/takeoff");
  const quantity = page.getByLabel("Level 2 open office walls quantity");
  await quantity.fill("4300");
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page.getByText("Quantity updated in demo data.")).toBeVisible();
  await page.getByRole("button", { name: "Approve takeoff" }).click();
  await page.getByRole("button", { name: "Approve takeoff" }).last().click();
  await expect(page.getByRole("button", { name: "Takeoff approved" })).toBeVisible();
});

test("compares quotes without auto-selecting the lowest", async ({ page }) => {
  await page.goto("/projects/prj_gulch/quotes");
  await expect(
    page.getByText(/Lowest price is not selected automatically/),
  ).toBeVisible();
  await page.getByLabel("Compare Midstate Painters").check();
  await page.getByLabel("Compare Volunteer Finishes").check();
  await expect(page.getByRole("cell", { name: "$241,500.00" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "$298,750.00" })).toBeVisible();
});

test("requires both human leads before proposal approval is complete", async ({
  page,
}) => {
  await page.goto("/projects/prj_gulch/proposal");
  await expect(page.getByText("Waiting on approval")).toBeVisible();
  await page.getByLabel("Demo role").selectOption("precon_lead");
  await page.getByRole("button", { name: "Approve my slot" }).click();
  await page.getByLabel("Demo role").selectOption("ai_assistant");
  await expect(page.getByRole("button", { name: "Approve my slot" })).toBeDisabled();
  await page.getByLabel("Demo role").selectOption("construction_lead");
  await page.getByRole("button", { name: "Approve my slot" }).click();
  await expect(page.getByText("Approved by every required lead")).toBeVisible();
});

test("filters demonstration reports and validates settings", async ({ page }) => {
  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
  await page.getByLabel("Trade").selectOption("carpentry");
  await expect(page.getByText("No demo bids match these filters")).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByRole("tab", { name: "Company" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: "Team & Roles" }).click();
  await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
  await page.getByRole("tab", { name: "Company" }).click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("A");
  await expect(page.getByText("Unsaved changes")).toBeVisible();
  await page.getByRole("button", { name: "Save company" }).click();
  await expect(page.getByText("Enter a workspace name.")).toBeVisible();
});

test("disables takeoff approval for the AI assistant", async ({ page }) => {
  await page.goto("/projects/prj_greenhills/takeoff");
  await page.getByLabel("Demo role").selectOption("ai_assistant");
  await expect(page.getByRole("button", { name: "Approve takeoff" })).toBeDisabled();
  await expect(page.getByText(/cannot make this decision/i).first()).toBeVisible();
});
