import type {
  AiRecommendation,
  DocumentType,
  HumanDecision,
  InboxType,
  ProjectStatus,
  ReviewStatus,
  RfiStatus,
  Role,
  ScopeStatus,
  TakeoffCategory,
  TaskGroup,
  Trade,
} from "@/types/domain";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  new: "New",
  screening: "Screening",
  go: "Go",
  reviewing: "Reviewing",
  pricing: "Pricing",
  submitted: "Submitted",
  won: "Won",
  lost: "Lost",
  no_go: "No Go",
};

export const TRADE_LABEL: Record<Trade, string> = {
  painting: "Painting",
  drywall: "Drywall",
  flooring: "Flooring",
  carpentry: "Carpentry",
  renovation: "Small renovations",
};

export const ROLE_LABEL: Record<Role, string> = {
  precon_lead: "Precon / Design Lead",
  construction_lead: "Construction Lead",
  ai_assistant: "AI Assistant",
};

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  drawing: "Drawing",
  specification: "Specification",
  bid_form: "Bid form",
  addendum: "Addendum",
  quote: "Quote",
  insurance: "Insurance",
  other: "Other",
};

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  unreviewed: "Unreviewed",
  in_review: "In review",
  reviewed: "Reviewed",
  superseded: "Superseded",
};

export const SCOPE_STATUS_LABEL: Record<ScopeStatus, string> = {
  included: "Included",
  excluded: "Excluded",
  not_applicable: "Not applicable",
  needs_clarification: "Needs clarification",
};

export const TAKEOFF_CATEGORY_LABEL: Record<TakeoffCategory, string> = {
  wall_area: "Wall area",
  ceiling_area: "Ceiling area",
  door_frame: "Door and frame",
  trim: "Trim",
  exposed_structure: "Exposed structure",
};

export const RFI_STATUS_LABEL: Record<RfiStatus, string> = {
  draft: "Draft",
  ready_for_review: "Ready for review",
  sent: "Sent",
  answered: "Answered",
  closed: "Closed",
};

export const AI_RECOMMENDATION_LABEL: Record<AiRecommendation, string> = {
  go: "Go",
  review: "Needs review",
  no_go: "No go",
};

export const HUMAN_DECISION_LABEL: Record<HumanDecision, string> = {
  go: "Go",
  no_go: "No go",
};

export const TASK_GROUP_LABEL: Record<TaskGroup, string> = {
  precon: "Precon",
  construction: "Construction",
  joint: "Joint",
};

export const INBOX_TYPE_LABEL: Record<InboxType, string> = {
  invitation: "Invitation",
  addendum: "Addendum",
  quote: "Quote",
  rfi_response: "RFI response",
  unmatched: "Needs matching",
};

export const TIMEZONE_LABEL = "America/Chicago";
