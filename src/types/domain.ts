export const PROJECT_STATUSES = [
  "new",
  "screening",
  "go",
  "reviewing",
  "pricing",
  "submitted",
  "won",
  "lost",
  "no_go",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TRADES = [
  "painting",
  "drywall",
  "flooring",
  "carpentry",
  "renovation",
] as const;

export type Trade = (typeof TRADES)[number];

export const ROLES = ["precon_lead", "construction_lead", "ai_assistant"] as const;

export type Role = (typeof ROLES)[number];

export const ACTIVE_STATUSES: ProjectStatus[] = [
  "new",
  "screening",
  "go",
  "reviewing",
  "pricing",
];

export type SourceReference = {
  documentId: string;
  filename: string;
  page: number | null;
  sheet: string | null;
  revision: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
};

export type GoNoGoCriterion = {
  id: string;
  label: string;
  weight: number;
  enabled: boolean;
};

export type NotificationPreferences = {
  invitations: boolean;
  addenda: boolean;
  quotes: boolean;
  rfis: boolean;
  deadlines: boolean;
};

export type ProposalTemplate = {
  inclusions: string;
  exclusions: string;
  clarifications: string;
};

export type Workspace = {
  id: string;
  name: string;
  legalName: string;
  city: string;
  state: string;
  homeBase: string;
  travelRadiusMiles: number;
  trades: Trade[];
  phone: string;
  email: string;
  proposalTemplate: ProposalTemplate;
  goNoGoCriteria: GoNoGoCriterion[];
  notifications: NotificationPreferences;
};

export type PaymentHistory = "current" | "slow" | "unknown";

export type GeneralContractor = {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  primaryContact: string;
  notes: string;
  insuranceOnFile: boolean;
  insuranceExpiresOn: string | null;
  projectsBid: number;
  winRate: number | null;
  paymentHistory: PaymentHistory;
};

export type Subcontractor = {
  id: string;
  name: string;
  trade: Trade;
  city: string;
  state: string;
  phone: string;
  email: string;
  primaryContact: string;
  notes: string;
  insuranceOnFile: boolean;
  insuranceExpiresOn: string | null;
  quoteCount: number;
  winRate: number | null;
  paymentHistory: PaymentHistory;
};

export type AiRecommendation = "go" | "review" | "no_go";
export type HumanDecision = "go" | "no_go";

export type Project = {
  id: string;
  name: string;
  number: string;
  location: string;
  city: string;
  state: string;
  trade: Trade;
  status: ProjectStatus;
  gcId: string;
  gcContactName: string;
  gcContactEmail: string;
  gcContactPhone: string;
  ownerId: string;
  estimatedValue: number | null;
  bidDueAt: string;
  timezone: "America/Chicago";
  siteVisitAt: string | null;
  rfiDueAt: string | null;
  aiRecommendation: AiRecommendation;
  aiScore: number;
  aiRationale: string;
  humanDecision: HumanDecision | null;
  humanDecisionNote: string | null;
  humanDecisionBy: string | null;
  nextAction: string;
  nextActionDueAt: string | null;
  documentCompleteness: number;
  samplePreconHours: number | null;
  createdAt: string;
};

export const DOCUMENT_TYPES = [
  "drawing",
  "specification",
  "bid_form",
  "addendum",
  "quote",
  "insurance",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const REVIEW_STATUSES = [
  "unreviewed",
  "in_review",
  "reviewed",
  "superseded",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type Document = {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  version: string;
  revisionDate: string;
  receivedAt: string;
  reviewStatus: ReviewStatus;
  source: string;
  filename: string;
  pageCount: number | null;
  changed: boolean;
  addendumNumber: string | null;
  notes: string | null;
};

export const SCOPE_STATUSES = [
  "included",
  "excluded",
  "not_applicable",
  "needs_clarification",
] as const;

export type ScopeStatus = (typeof SCOPE_STATUSES)[number];

export const APPROVAL_STATES = ["draft", "pending", "approved", "rejected"] as const;

export type ApprovalState = (typeof APPROVAL_STATES)[number];

export type ScopeItem = {
  id: string;
  projectId: string;
  requirement: string;
  aiFinding: string;
  source: SourceReference | null;
  riskNote: string | null;
  status: ScopeStatus;
  reviewerId: string | null;
  approval: ApprovalState;
};

export const TAKEOFF_CATEGORIES = [
  "wall_area",
  "ceiling_area",
  "door_frame",
  "trim",
  "exposed_structure",
] as const;

export type TakeoffCategory = (typeof TAKEOFF_CATEGORIES)[number];

export type TakeoffItem = {
  id: string;
  projectId: string;
  category: TakeoffCategory;
  item: string;
  location: string;
  quantity: number;
  unit: string;
  finish: string | null;
  source: SourceReference | null;
  scale: string | null;
  assumptions: string;
  exclusions: string;
  confidence: number;
  approval: ApprovalState;
  demo: true;
};

export const RFI_STATUSES = [
  "draft",
  "ready_for_review",
  "sent",
  "answered",
  "closed",
] as const;

export type RfiStatus = (typeof RFI_STATUSES)[number];

export type Rfi = {
  id: string;
  projectId: string;
  number: string;
  question: string;
  reason: string;
  status: RfiStatus;
  source: SourceReference | null;
  reviewerId: string | null;
  dueAt: string | null;
  aiDrafted: boolean;
  answer: string | null;
  sentAt: string | null;
};

export type InsuranceStatus = "current" | "expiring" | "missing";

export type Quote = {
  id: string;
  projectId: string;
  subcontractorId: string;
  trade: Trade;
  amount: number;
  validUntil: string;
  inclusions: string[];
  exclusions: string[];
  insuranceStatus: InsuranceStatus;
  missingScope: string[];
  riskFlags: string[];
  notes: string;
  receivedAt: string;
  selected: boolean;
};

export type EstimateLine = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  materialCost: number;
  laborCost: number;
  subcontractorCost: number;
  otherCost: number;
  quoteId: string | null;
  assumption: string | null;
};

export type Estimate = {
  projectId: string;
  markupPercent: number;
  contingencyPercent: number;
  assumptions: string[];
  exclusions: string[];
  allowances: string[];
  lines: EstimateLine[];
  bidPrice: number | null;
  bidPriceSetBy: string | null;
};

export const PROPOSAL_SECTIONS = [
  "inclusions",
  "exclusions",
  "clarifications",
  "alternates",
  "pricing",
  "addenda",
] as const;

export type ProposalSectionKey = (typeof PROPOSAL_SECTIONS)[number];

export type ProposalApprovalSlot = {
  status: "pending" | "approved";
  by: string | null;
  at: string | null;
};

export type Proposal = {
  projectId: string;
  sections: Record<ProposalSectionKey, string>;
  unverifiedItems: string[];
  attachments: { name: string; ready: boolean }[];
  addendaAcknowledged: { id: string; label: string; acknowledged: boolean }[];
  approvals: {
    precon: ProposalApprovalSlot;
    construction: ProposalApprovalSlot;
  };
};

export type SubmissionOutcome = "pending" | "won" | "lost" | "no_bid";

export type Submission = {
  projectId: string;
  requiredDocuments: { name: string; ready: boolean }[];
  submittedAt: string | null;
  outcome: SubmissionOutcome | null;
  outcomeNote: string | null;
  simulated: true;
};

export const TASK_GROUPS = ["precon", "construction", "joint"] as const;

export type TaskGroup = (typeof TASK_GROUPS)[number];

export type Task = {
  id: string;
  projectId: string;
  title: string;
  ownerGroup: TaskGroup;
  assigneeId: string | null;
  dueAt: string;
  status: "open" | "done";
  kind: "deadline" | "site_visit" | "rfi" | "approval" | "general";
  href: string;
};

export type NotificationType =
  "invitation" | "addendum" | "quote" | "rfi_response" | "unmatched" | "approval";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  projectId: string | null;
  createdAt: string;
  read: boolean;
  href: string;
};

export type InboxType =
  "invitation" | "addendum" | "quote" | "rfi_response" | "unmatched";

export type InboxItem = {
  id: string;
  type: InboxType;
  title: string;
  summary: string;
  receivedAt: string;
  read: boolean;
  projectId: string | null;
  suggestedProjectId: string | null;
};

export type AuditEvent = {
  id: string;
  projectId: string;
  at: string;
  actorId: string;
  actorRole: Role | "system";
  action: string;
  detail: string;
};

export type ProjectDetail = Project & {
  gcName: string;
  ownerName: string;
  outstandingApprovals: string[];
};

export type ProjectListItem = {
  id: string;
  name: string;
  number: string;
  city: string;
  trade: Trade;
  status: ProjectStatus;
  gcId: string;
  gcName: string;
  ownerId: string;
  ownerName: string;
  bidDueAt: string;
  estimatedValue: number | null;
  nextAction: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DeadlineFilter = "all" | "overdue" | "today" | "soon" | "week";

export type ProjectSortKey = "bidDueAt" | "name" | "estimatedValue" | "status";

export type ProjectListQuery = {
  search?: string;
  status?: ProjectStatus | "all";
  trade?: Trade | "all";
  ownerId?: string | "all";
  gcId?: string | "all";
  deadline?: DeadlineFilter;
  sort?: ProjectSortKey;
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type NewProjectInput = {
  name: string;
  location: string;
  city: string;
  trade: Trade;
  gcId: string;
  bidDueAt: string;
  estimatedValue: number | null;
  ownerId: string;
};

export type DashboardSummary = {
  activeBids: number;
  submittedBids: number;
  deadlinesThisWeek: number;
  awaitingReview: number;
  deadlines: ProjectListItem[];
  siteVisits: { project: ProjectListItem; at: string }[];
  rfiDeadlines: { project: ProjectListItem; at: string; label: string }[];
  overdue: { project: ProjectListItem; label: string; at: string; href: string }[];
  tasks: Task[];
  approvals: { project: ProjectListItem; label: string; href: string }[];
  recent: Notification[];
  nextActions: {
    project: ProjectListItem;
    action: string;
    dueAt: string | null;
    ownerName: string;
  }[];
};

export type ReportRange = "30" | "90" | "365";

export type ReportPoint = {
  gcId: string;
  gcName: string;
  trade: Trade;
  status: ProjectStatus;
  value: number | null;
  bidDueAt: string;
  samplePreconHours: number | null;
  inRange: boolean;
  active: boolean;
};

export type ReportSummary = {
  range: ReportRange;
  demonstration: true;
  bidsSubmitted: number;
  wins: number;
  losses: number;
  winRate: number | null;
  averageBidSize: number | null;
  pipelineValue: number;
  hoursSpent: number | null;
  byContractor: {
    id: string;
    name: string;
    won: number;
    lost: number;
    hitRate: number | null;
  }[];
  byTrade: { trade: Trade; won: number; lost: number; hitRate: number | null }[];
  pipelineByStatus: { status: ProjectStatus; count: number; value: number }[];
  points: ReportPoint[];
  valueByMonth: { month: string; value: number }[];
};
