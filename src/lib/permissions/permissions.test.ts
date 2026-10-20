import { describe, expect, it } from "vitest";

import {
  can,
  canApproveProposalSlot,
  denialReason,
  proposalSlotDenial,
} from "@/lib/permissions/permissions";

describe("permissions", () => {
  it("lets the precon lead approve takeoff and blocks the assistant", () => {
    expect(can("precon_lead", "approve_takeoff")).toBe(true);
    expect(can("construction_lead", "approve_takeoff")).toBe(false);
    expect(can("ai_assistant", "approve_takeoff")).toBe(false);
    expect(denialReason("ai_assistant", "set_bid_price")).toMatch(
      /cannot make this decision/i,
    );
  });

  it("requires the matching human lead for each proposal slot", () => {
    expect(canApproveProposalSlot("precon_lead", "precon")).toBe(true);
    expect(canApproveProposalSlot("precon_lead", "construction")).toBe(false);
    expect(canApproveProposalSlot("construction_lead", "construction")).toBe(true);
    expect(proposalSlotDenial("ai_assistant", "precon")).toMatch(/both human leads/i);
  });

  it("reserves bid price and outcomes for the construction lead", () => {
    expect(can("construction_lead", "set_bid_price")).toBe(true);
    expect(can("construction_lead", "record_outcome")).toBe(true);
    expect(denialReason("precon_lead", "select_subcontractor")).toMatch(
      /Construction Lead/,
    );
  });
});
