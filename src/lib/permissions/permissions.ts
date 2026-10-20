import type { Role } from "@/types/domain";

export const PERMISSIONS = [
  "review_documents",
  "edit_scope",
  "approve_scope",
  "edit_takeoff",
  "approve_takeoff",
  "draft_rfi",
  "send_rfi",
  "decide_go_no_go",
  "select_subcontractor",
  "set_bid_price",
  "edit_estimate",
  "approve_proposal",
  "record_outcome",
  "submit_bid",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const GRANTED: Record<Permission, Role[]> = {
  review_documents: ["precon_lead"],
  edit_scope: ["precon_lead"],
  approve_scope: ["precon_lead"],
  edit_takeoff: ["precon_lead"],
  approve_takeoff: ["precon_lead"],
  draft_rfi: ["precon_lead"],
  send_rfi: ["precon_lead"],
  decide_go_no_go: ["construction_lead"],
  select_subcontractor: ["construction_lead"],
  set_bid_price: ["construction_lead"],
  edit_estimate: ["precon_lead", "construction_lead"],
  approve_proposal: ["precon_lead", "construction_lead"],
  record_outcome: ["construction_lead"],
  submit_bid: ["construction_lead"],
};

export function can(role: Role, permission: Permission): boolean {
  return GRANTED[permission].includes(role);
}

export function canApproveProposalSlot(
  role: Role,
  slot: "precon" | "construction",
): boolean {
  return slot === "precon" ? role === "precon_lead" : role === "construction_lead";
}

export function denialReason(role: Role, permission: Permission): string | null {
  if (can(role, permission)) return null;
  if (role === "ai_assistant") {
    return "The AI assistant can draft and organize. It cannot make this decision.";
  }
  if (
    permission === "approve_takeoff" ||
    permission === "edit_takeoff" ||
    permission === "send_rfi" ||
    permission === "edit_scope"
  ) {
    return "This action is reserved for the Precon / Design Lead.";
  }
  if (
    permission === "decide_go_no_go" ||
    permission === "select_subcontractor" ||
    permission === "set_bid_price" ||
    permission === "record_outcome" ||
    permission === "submit_bid"
  ) {
    return "This action is reserved for the Construction Lead.";
  }
  return "Your demo role cannot perform this action.";
}

export function proposalSlotDenial(
  role: Role,
  slot: "precon" | "construction",
): string | null {
  if (canApproveProposalSlot(role, slot)) return null;
  if (role === "ai_assistant") {
    return "The AI assistant cannot approve a proposal. Both human leads must approve.";
  }
  return slot === "precon"
    ? "Only the Precon / Design Lead can approve this slot."
    : "Only the Construction Lead can approve this slot.";
}
