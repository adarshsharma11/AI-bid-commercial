import { ACTIVE_STATUSES } from "@/types/domain";
import type {
  DashboardSummary,
  Estimate,
  GeneralContractor,
  InboxType,
  NewProjectInput,
  ProjectDetail,
  ProjectListQuery,
  Proposal,
  ReportRange,
  ReportSummary,
  Rfi,
  Role,
  ScopeItem,
  ScopeStatus,
  SubmissionOutcome,
  Subcontractor,
  TakeoffItem,
  Workspace,
} from "@/types/domain";
import { classifyDeadline, isDueThisWeek } from "@/lib/utils/deadline";
import { queryProjects, toListItem } from "@/lib/utils/projects";
import { buildReport } from "@/lib/utils/reports";
import {
  denialReason,
  proposalSlotDenial,
  type Permission,
} from "@/lib/permissions/permissions";
import { PermissionError } from "@/lib/permissions/errors";
import { createSeed } from "@/mocks/seed";

export type Actor = { userId: string; role: Role };

let database = createSeed(new Date());

export function resetDatabase(now = new Date()) {
  database = createSeed(now);
}

export function actorForRole(role: Role): Actor {
  const user = database.users.find((item) => item.role === role);
  if (!user) throw new Error("No demo user exists for that role.");
  return { userId: user.id, role };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertCan(actor: Actor, permission: Permission) {
  const reason = denialReason(actor.role, permission);
  if (reason) throw new PermissionError(reason);
}

function projectOrThrow(projectId: string) {
  const project = database.projects.find((item) => item.id === projectId);
  if (!project) throw new Error("Project not found.");
  return project;
}

function record(projectId: string, actor: Actor, action: string, detail: string) {
  database.audit.unshift({
    id: `audit_${crypto.randomUUID()}`,
    projectId,
    at: new Date().toISOString(),
    actorId: actor.userId,
    actorRole: actor.role,
    action,
    detail,
  });
}

export function listProjects(query: ProjectListQuery, now: Date) {
  return queryProjects(
    database.projects,
    database.generalContractors,
    database.users,
    query,
    now,
  );
}

export function getProject(projectId: string): ProjectDetail {
  const project = projectOrThrow(projectId);
  const takeoffOpen = database.takeoffItems.some(
    (item) => item.projectId === projectId && item.approval !== "approved",
  );
  const scopeOpen = database.scopeItems.some(
    (item) => item.projectId === projectId && item.approval !== "approved",
  );
  const proposal = database.proposals.find((item) => item.projectId === projectId);
  const outstandingApprovals = [
    takeoffOpen ? "Takeoff approval" : null,
    scopeOpen ? "Scope review" : null,
    project.humanDecision == null ? "Human go/no-go decision" : null,
    proposal?.approvals.precon.status !== "approved" ? "Precon proposal approval" : null,
    proposal?.approvals.construction.status !== "approved"
      ? "Construction proposal approval"
      : null,
  ].filter((item): item is string => item != null);

  return clone({
    ...project,
    gcName:
      database.generalContractors.find((item) => item.id === project.gcId)?.name ??
      "Unknown",
    ownerName:
      database.users.find((item) => item.id === project.ownerId)?.name ?? "Unassigned",
    outstandingApprovals,
  });
}

export function getDashboard(now: Date): DashboardSummary {
  const items = database.projects.map((project) =>
    toListItem(project, database.generalContractors, database.users),
  );
  const byId = new Map(items.map((item) => [item.id, item]));
  const active = database.projects.filter((project) =>
    ACTIVE_STATUSES.includes(project.status),
  );
  const deadlines = items
    .filter((item) => isDueThisWeek(item.bidDueAt, now))
    .sort((left, right) => left.bidDueAt.localeCompare(right.bidDueAt));
  const siteVisits = database.projects
    .filter(
      (project) =>
        project.siteVisitAt && classifyDeadline(project.siteVisitAt, now) !== "overdue",
    )
    .filter((project) => {
      const tone = classifyDeadline(project.siteVisitAt, now);
      return (
        tone === "today" || tone === "soon" || isDueThisWeek(project.siteVisitAt, now)
      );
    })
    .map((project) => ({ project: byId.get(project.id)!, at: project.siteVisitAt! }));
  const rfiDeadlines = database.rfis
    .filter((rfi) => rfi.dueAt && rfi.status !== "closed" && rfi.status !== "answered")
    .map((rfi) => ({
      project: byId.get(rfi.projectId)!,
      at: rfi.dueAt!,
      label: rfi.number,
    }))
    .filter((item) => item.project)
    .sort((left, right) => left.at.localeCompare(right.at));
  const overdueTasks = database.tasks
    .filter(
      (task) => task.status === "open" && classifyDeadline(task.dueAt, now) === "overdue",
    )
    .map((task) => ({
      project: byId.get(task.projectId)!,
      label: task.title,
      at: task.dueAt,
      href: task.href,
    }));
  const awaiting = new Set(
    database.takeoffItems
      .filter((item) => item.approval === "pending" || item.approval === "draft")
      .map((item) => item.projectId),
  );

  return {
    activeBids: active.length,
    submittedBids: database.projects.filter((project) =>
      ["submitted", "won", "lost"].includes(project.status),
    ).length,
    deadlinesThisWeek: deadlines.length,
    awaitingReview: awaiting.size,
    deadlines,
    siteVisits,
    rfiDeadlines,
    overdue: overdueTasks,
    tasks: clone(database.tasks.filter((task) => task.status === "open")),
    approvals: active
      .filter((project) => awaiting.has(project.id) || project.humanDecision == null)
      .map((project) => ({
        project: byId.get(project.id)!,
        label:
          project.humanDecision == null ? "Go/no-go still open" : "Review still open",
        href:
          project.humanDecision == null
            ? `/projects/${project.id}`
            : `/projects/${project.id}/takeoff`,
      })),
    recent: clone(
      [...database.notifications].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    ).slice(0, 6),
    nextActions: active
      .map((project) => ({
        project: byId.get(project.id)!,
        action: project.nextAction,
        dueAt: project.nextActionDueAt,
        ownerName: byId.get(project.id)!.ownerName,
      }))
      .sort((left, right) => (left.dueAt ?? "9999").localeCompare(right.dueAt ?? "9999")),
  };
}

export function listDocuments(projectId: string) {
  projectOrThrow(projectId);
  return clone(database.documents.filter((item) => item.projectId === projectId));
}

export function updateDocumentReview(
  documentId: string,
  reviewStatus: "unreviewed" | "in_review" | "reviewed",
  actor: Actor,
) {
  assertCan(actor, "review_documents");
  const document = database.documents.find((item) => item.id === documentId);
  if (!document) throw new Error("Document not found.");
  document.reviewStatus = reviewStatus;
  record(
    document.projectId,
    actor,
    "Document review updated",
    `${document.name} marked ${reviewStatus}.`,
  );
  return clone(document);
}

export function listScope(projectId: string) {
  return clone(database.scopeItems.filter((item) => item.projectId === projectId));
}

export function updateScopeItem(
  id: string,
  input: { status: ScopeStatus; riskNote: string | null; aiFinding: string },
  actor: Actor,
) {
  assertCan(actor, "edit_scope");
  const item = database.scopeItems.find((scope) => scope.id === id);
  if (!item) throw new Error("Scope item not found.");
  item.status = input.status;
  item.riskNote = input.riskNote;
  item.aiFinding = input.aiFinding;
  item.reviewerId = actor.userId;
  item.approval = "pending";
  record(item.projectId, actor, "Scope item edited", item.requirement);
  return clone(item);
}

export function approveScopeItem(id: string, actor: Actor) {
  assertCan(actor, "approve_scope");
  const item = database.scopeItems.find((scope) => scope.id === id);
  if (!item) throw new Error("Scope item not found.");
  item.approval = "approved";
  item.reviewerId = actor.userId;
  record(item.projectId, actor, "Scope item approved", item.requirement);
  return clone(item);
}

export function listTakeoff(projectId: string) {
  return clone(database.takeoffItems.filter((item) => item.projectId === projectId));
}

export function updateTakeoffItem(
  id: string,
  input: Pick<TakeoffItem, "quantity" | "assumptions" | "exclusions">,
  actor: Actor,
) {
  assertCan(actor, "edit_takeoff");
  const item = database.takeoffItems.find((row) => row.id === id);
  if (!item) throw new Error("Takeoff item not found.");
  item.quantity = input.quantity;
  item.assumptions = input.assumptions;
  item.exclusions = input.exclusions;
  item.approval = "pending";
  record(
    item.projectId,
    actor,
    "Takeoff quantity edited",
    `${item.item} set to ${input.quantity} ${item.unit}. Demo data only.`,
  );
  return clone(item);
}

export function approveTakeoff(projectId: string, actor: Actor) {
  assertCan(actor, "approve_takeoff");
  const rows = database.takeoffItems.filter((item) => item.projectId === projectId);
  if (rows.length === 0) throw new Error("This project has no takeoff items.");
  for (const row of rows) row.approval = "approved";
  record(
    projectId,
    actor,
    "Takeoff approved",
    "A human lead approved the sample takeoff. This did not measure drawings.",
  );
  return clone(rows);
}

export function listRfis(projectId: string) {
  return clone(database.rfis.filter((item) => item.projectId === projectId));
}

export function saveRfi(
  id: string,
  input: { question: string; reason: string },
  actor: Actor,
) {
  assertCan(actor, "draft_rfi");
  const rfi = database.rfis.find((item) => item.id === id);
  if (!rfi) throw new Error("RFI not found.");
  if (rfi.status === "sent" || rfi.status === "answered" || rfi.status === "closed") {
    throw new Error("Sent RFIs stay in the log. Draft a follow-up instead.");
  }
  rfi.question = input.question;
  rfi.reason = input.reason;
  rfi.status = "ready_for_review";
  rfi.reviewerId = actor.userId;
  record(rfi.projectId, actor, "RFI draft saved", rfi.number);
  return clone(rfi);
}

export function sendRfi(id: string, actor: Actor) {
  assertCan(actor, "send_rfi");
  const rfi = database.rfis.find((item) => item.id === id);
  if (!rfi) throw new Error("RFI not found.");
  if (rfi.status === "draft")
    throw new Error("Save the draft for review before sending.");
  rfi.status = "sent";
  rfi.sentAt = new Date().toISOString();
  record(
    rfi.projectId,
    actor,
    "RFI send simulated",
    `${rfi.number} was marked sent in the demo. No email was delivered.`,
  );
  return clone(rfi);
}

export function listQuotes(projectId: string) {
  return clone(database.quotes.filter((item) => item.projectId === projectId));
}

export function selectQuote(quoteId: string, actor: Actor) {
  assertCan(actor, "select_subcontractor");
  const quote = database.quotes.find((item) => item.id === quoteId);
  if (!quote) throw new Error("Quote not found.");
  for (const item of database.quotes) {
    if (item.projectId === quote.projectId) item.selected = item.id === quoteId;
  }
  const sub = database.subcontractors.find((item) => item.id === quote.subcontractorId);
  record(
    quote.projectId,
    actor,
    "Subcontractor selected",
    `${sub?.name ?? "Subcontractor"} selected by the Construction Lead. Lowest price was not chosen automatically.`,
  );
  return clone(database.quotes.filter((item) => item.projectId === quote.projectId));
}

export function getEstimate(projectId: string) {
  const estimate = database.estimates.find((item) => item.projectId === projectId);
  if (!estimate) throw new Error("Estimate not found.");
  return clone(estimate);
}

export function updateEstimate(
  projectId: string,
  input: Pick<
    Estimate,
    | "lines"
    | "markupPercent"
    | "contingencyPercent"
    | "assumptions"
    | "exclusions"
    | "allowances"
  >,
  actor: Actor,
) {
  assertCan(actor, "edit_estimate");
  const estimate = database.estimates.find((item) => item.projectId === projectId);
  if (!estimate) throw new Error("Estimate not found.");
  estimate.lines = input.lines;
  estimate.markupPercent = input.markupPercent;
  estimate.contingencyPercent = input.contingencyPercent;
  estimate.assumptions = input.assumptions;
  estimate.exclusions = input.exclusions;
  estimate.allowances = input.allowances;
  record(
    projectId,
    actor,
    "Estimate draft edited",
    "Line items changed. The official bid price was left unchanged.",
  );
  return clone(estimate);
}

export function setBidPrice(projectId: string, bidPrice: number, actor: Actor) {
  assertCan(actor, "set_bid_price");
  const estimate = database.estimates.find((item) => item.projectId === projectId);
  if (!estimate) throw new Error("Estimate not found.");
  estimate.bidPrice = bidPrice;
  estimate.bidPriceSetBy = actor.userId;
  const proposal = database.proposals.find((item) => item.projectId === projectId);
  if (proposal) {
    proposal.sections.pricing = `Official bid price set by the Construction Lead in this demo: ${bidPrice}.`;
    proposal.approvals.precon = { status: "pending", by: null, at: null };
    proposal.approvals.construction = { status: "pending", by: null, at: null };
  }
  record(
    projectId,
    actor,
    "Bid price set",
    "The Construction Lead set the official bid price. Prior proposal approvals were cleared.",
  );
  return clone(estimate);
}

export function getProposal(projectId: string) {
  const proposal = database.proposals.find((item) => item.projectId === projectId);
  if (!proposal) throw new Error("Proposal not found.");
  return clone(proposal);
}

export function updateProposal(
  projectId: string,
  sections: Proposal["sections"],
  actor: Actor,
) {
  assertCan(actor, "edit_estimate");
  const proposal = database.proposals.find((item) => item.projectId === projectId);
  if (!proposal) throw new Error("Proposal not found.");
  proposal.sections = sections;
  if (
    proposal.approvals.precon.status === "approved" ||
    proposal.approvals.construction.status === "approved"
  ) {
    proposal.approvals.precon = { status: "pending", by: null, at: null };
    proposal.approvals.construction = { status: "pending", by: null, at: null };
  }
  record(
    projectId,
    actor,
    "Proposal draft edited",
    "Draft text changed. Existing approvals were cleared.",
  );
  return clone(proposal);
}

export function acknowledgeAddendum(projectId: string, addendumId: string, actor: Actor) {
  assertCan(actor, "review_documents");
  const proposal = database.proposals.find((item) => item.projectId === projectId);
  if (!proposal) throw new Error("Proposal not found.");
  const addendum = proposal.addendaAcknowledged.find((item) => item.id === addendumId);
  if (!addendum) throw new Error("Addendum not found.");
  addendum.acknowledged = true;
  record(projectId, actor, "Addendum acknowledged", addendum.label);
  return clone(proposal);
}

export function approveProposal(projectId: string, actor: Actor) {
  const slot =
    actor.role === "precon_lead"
      ? "precon"
      : actor.role === "construction_lead"
        ? "construction"
        : null;
  if (!slot) {
    throw new PermissionError(
      proposalSlotDenial(actor.role, "precon") ?? "Approval denied.",
    );
  }
  const reason = proposalSlotDenial(actor.role, slot);
  if (reason) throw new PermissionError(reason);
  assertCan(actor, "approve_proposal");
  const proposal = database.proposals.find((item) => item.projectId === projectId);
  if (!proposal) throw new Error("Proposal not found.");
  proposal.approvals[slot] = {
    status: "approved",
    by: actor.userId,
    at: new Date().toISOString(),
  };
  record(
    projectId,
    actor,
    "Proposal slot approved",
    `${slot} approval recorded. Both leads are still required before submission.`,
  );
  return clone(proposal);
}

export function getSubmission(projectId: string) {
  const submission = database.submissions.find((item) => item.projectId === projectId);
  if (!submission) throw new Error("Submission not found.");
  return clone(submission);
}

export function submitBid(projectId: string, actor: Actor) {
  assertCan(actor, "submit_bid");
  const proposal = database.proposals.find((item) => item.projectId === projectId);
  if (!proposal) throw new Error("Proposal not found.");
  if (
    proposal.approvals.precon.status !== "approved" ||
    proposal.approvals.construction.status !== "approved"
  ) {
    throw new PermissionError(
      "Both the Precon Lead and the Construction Lead must approve before submission.",
    );
  }
  const estimate = database.estimates.find((item) => item.projectId === projectId);
  if (!estimate?.bidPrice)
    throw new Error("Set an official bid price before submission.");
  const submission = database.submissions.find((item) => item.projectId === projectId);
  if (!submission) throw new Error("Submission not found.");
  submission.submittedAt = new Date().toISOString();
  submission.outcome = "pending";
  submission.requiredDocuments = submission.requiredDocuments.map((item) => ({
    ...item,
    ready: true,
  }));
  const project = projectOrThrow(projectId);
  project.status = "submitted";
  record(
    projectId,
    actor,
    "Submission simulated",
    "The bid was marked submitted in demo data. Nothing was sent to a GC.",
  );
  return clone(submission);
}

export function recordOutcome(
  projectId: string,
  outcome: Extract<SubmissionOutcome, "won" | "lost">,
  note: string,
  actor: Actor,
) {
  assertCan(actor, "record_outcome");
  const submission = database.submissions.find((item) => item.projectId === projectId);
  if (!submission?.submittedAt)
    throw new Error("Submit the bid before recording an outcome.");
  submission.outcome = outcome;
  submission.outcomeNote = note;
  projectOrThrow(projectId).status = outcome;
  record(projectId, actor, "Outcome recorded", note || outcome);
  return clone(submission);
}

export function decideGoNoGo(
  projectId: string,
  decision: "go" | "no_go",
  note: string,
  actor: Actor,
) {
  assertCan(actor, "decide_go_no_go");
  const project = projectOrThrow(projectId);
  project.humanDecision = decision;
  project.humanDecisionNote = note;
  project.humanDecisionBy = actor.userId;
  if (decision === "no_go") project.status = "no_go";
  if (
    decision === "go" &&
    (project.status === "new" ||
      project.status === "screening" ||
      project.status === "no_go")
  ) {
    project.status = "go";
  }
  record(
    projectId,
    actor,
    "Go/no-go decision",
    `${decision === "go" ? "Go" : "No go"}. ${note}`,
  );
  return getProject(projectId);
}

export function createProject(input: NewProjectInput, actor: Actor) {
  assertCan(actor, "review_documents");
  const id = `prj_${crypto.randomUUID().slice(0, 8)}`;
  const gc = database.generalContractors.find((item) => item.id === input.gcId);
  const project = {
    id,
    name: input.name.trim(),
    number: `SC-${new Date().getFullYear().toString().slice(2)}-${database.projects.length + 1}`,
    location: input.location.trim(),
    city: input.city.trim(),
    state: "TN",
    trade: input.trade,
    status: "new" as const,
    gcId: input.gcId,
    gcContactName: gc?.primaryContact ?? "Unknown",
    gcContactEmail: gc?.email ?? "",
    gcContactPhone: gc?.phone ?? "",
    ownerId: input.ownerId,
    estimatedValue: input.estimatedValue,
    bidDueAt: new Date(input.bidDueAt).toISOString(),
    timezone: "America/Chicago" as const,
    siteVisitAt: null,
    rfiDueAt: null,
    aiRecommendation: "review" as const,
    aiScore: 50,
    aiRationale:
      "Newly added in the demo. The assistant has not scored a complete package, and no human decision has been made.",
    humanDecision: null,
    humanDecisionNote: null,
    humanDecisionBy: null,
    nextAction: "Screen drawings and decide go or no-go",
    nextActionDueAt: new Date(input.bidDueAt).toISOString(),
    documentCompleteness: 0,
    samplePreconHours: null,
    createdAt: new Date().toISOString(),
  };
  database.projects.unshift(project);
  database.estimates.push({
    projectId: id,
    markupPercent: 12,
    contingencyPercent: 4,
    assumptions: ["No quantities yet."],
    exclusions: [database.workspace.proposalTemplate.exclusions],
    allowances: [],
    lines: [],
    bidPrice: null,
    bidPriceSetBy: null,
  });
  database.proposals.push(blankProposal(id));
  database.submissions.push({
    projectId: id,
    requiredDocuments: [
      { name: "Proposal", ready: false },
      { name: "Bid form", ready: false },
      { name: "Insurance", ready: false },
      { name: "Addenda acknowledgement", ready: false },
    ],
    submittedAt: null,
    outcome: null,
    outcomeNote: null,
    simulated: true,
  });
  record(
    id,
    actor,
    "Project created",
    "Added from the demo form. Not saved to a production system.",
  );
  return getProject(id);
}

function blankProposal(projectId: string): Proposal {
  const template = database.workspace.proposalTemplate;
  return {
    projectId,
    sections: {
      inclusions: template.inclusions,
      exclusions: template.exclusions,
      clarifications: template.clarifications,
      alternates: "",
      pricing: "No official bid price yet.",
      addenda: "No addenda on file.",
    },
    unverifiedItems: ["No documents have been reviewed."],
    attachments: [
      { name: "Bid form", ready: false },
      { name: "Insurance certificate", ready: false },
    ],
    addendaAcknowledged: [],
    approvals: {
      precon: { status: "pending", by: null, at: null },
      construction: { status: "pending", by: null, at: null },
    },
  };
}

export function listActivity(projectId: string) {
  return clone(database.audit.filter((item) => item.projectId === projectId));
}

export function listSubcontractors(search: string) {
  const needle = search.trim().toLowerCase();
  return clone(
    database.subcontractors.filter((item) =>
      needle
        ? `${item.name} ${item.city} ${item.trade} ${item.primaryContact}`
            .toLowerCase()
            .includes(needle)
        : true,
    ),
  );
}

export function listGeneralContractors(search: string) {
  const needle = search.trim().toLowerCase();
  return clone(
    database.generalContractors.filter((item) =>
      needle
        ? `${item.name} ${item.city} ${item.primaryContact}`
            .toLowerCase()
            .includes(needle)
        : true,
    ),
  );
}

type DirectoryInput = {
  id?: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  primaryContact: string;
  notes: string;
};

export function saveSubcontractor(
  input: DirectoryInput & { trade: Subcontractor["trade"] },
) {
  if (input.id) {
    const current = database.subcontractors.find((item) => item.id === input.id);
    if (!current) throw new Error("Subcontractor not found.");
    Object.assign(current, {
      name: input.name,
      city: input.city,
      phone: input.phone,
      email: input.email,
      primaryContact: input.primaryContact,
      notes: input.notes,
      trade: input.trade,
    });
    return clone(current);
  }
  const created: Subcontractor = {
    id: `sub_${crypto.randomUUID().slice(0, 8)}`,
    name: input.name,
    trade: input.trade,
    city: input.city,
    state: "TN",
    phone: input.phone,
    email: input.email,
    primaryContact: input.primaryContact,
    notes: input.notes,
    insuranceOnFile: false,
    insuranceExpiresOn: null,
    quoteCount: 0,
    winRate: null,
    paymentHistory: "unknown",
  };
  database.subcontractors.unshift(created);
  return clone(created);
}

export function saveGeneralContractor(input: DirectoryInput & { id?: string }) {
  if (input.id) {
    const current = database.generalContractors.find((item) => item.id === input.id);
    if (!current) throw new Error("General contractor not found.");
    Object.assign(current, {
      name: input.name,
      city: input.city,
      phone: input.phone,
      email: input.email,
      primaryContact: input.primaryContact,
      notes: input.notes,
    });
    return clone(current);
  }
  const created: GeneralContractor = {
    id: `gc_${crypto.randomUUID().slice(0, 8)}`,
    name: input.name,
    category: "Commercial GC",
    city: input.city,
    state: "TN",
    phone: input.phone,
    email: input.email,
    website: "",
    primaryContact: input.primaryContact,
    notes: input.notes,
    insuranceOnFile: false,
    insuranceExpiresOn: null,
    projectsBid: 0,
    winRate: null,
    paymentHistory: "unknown",
  };
  database.generalContractors.unshift(created);
  return clone(created);
}

export function quotesForSubcontractor(subcontractorId: string) {
  return clone(
    database.quotes.filter((item) => item.subcontractorId === subcontractorId),
  );
}

export function projectsForCompany(kind: "gc" | "sub", id: string) {
  if (kind === "gc") {
    return clone(
      database.projects
        .filter((project) => project.gcId === id)
        .map((project) =>
          toListItem(project, database.generalContractors, database.users),
        ),
    );
  }
  const projectIds = new Set(
    database.quotes
      .filter((quote) => quote.subcontractorId === id)
      .map((quote) => quote.projectId),
  );
  return clone(
    database.projects
      .filter((project) => projectIds.has(project.id))
      .map((project) => toListItem(project, database.generalContractors, database.users)),
  );
}

export function listInbox(type: InboxType | "all") {
  return clone(
    database.inbox
      .filter((item) => (type === "all" ? true : item.type === type))
      .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt)),
  );
}

export function reviewInbox(id: string) {
  const item = database.inbox.find((entry) => entry.id === id);
  if (!item) throw new Error("Inbox item not found.");
  item.read = true;
  return clone(item);
}

export function matchInbox(id: string, projectId: string) {
  projectOrThrow(projectId);
  const item = database.inbox.find((entry) => entry.id === id);
  if (!item) throw new Error("Inbox item not found.");
  item.projectId = projectId;
  item.read = true;
  item.type = item.type === "unmatched" ? "quote" : item.type;
  return clone(item);
}

export function listNotifications() {
  return clone(
    [...database.notifications].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    ),
  );
}

export function markNotificationRead(id: string) {
  const item = database.notifications.find((entry) => entry.id === id);
  if (!item) throw new Error("Notification not found.");
  item.read = true;
  return clone(item);
}

export function getReport(range: ReportRange, now: Date): ReportSummary {
  return buildReport(database.projects, database.generalContractors, range, now);
}

export function getWorkspace() {
  return clone(database.workspace);
}

export function updateWorkspace(input: Partial<Workspace>) {
  database.workspace = { ...database.workspace, ...input, id: database.workspace.id };
  return clone(database.workspace);
}

export function listUsers() {
  return clone(database.users);
}

export function addUser(input: {
  name: string;
  email: string;
  role: Role;
  title: string;
}) {
  const user = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    ...input,
  };
  database.users.push(user);
  return clone(user);
}

export function listReferenceData() {
  return {
    users: clone(database.users.filter((user) => user.role !== "ai_assistant")),
    generalContractors: clone(database.generalContractors),
    subcontractors: clone(database.subcontractors),
  };
}

export function getScopeItem(id: string): ScopeItem | undefined {
  const item = database.scopeItems.find((scope) => scope.id === id);
  return item ? clone(item) : undefined;
}

export function getRfi(id: string): Rfi | undefined {
  const item = database.rfis.find((rfi) => rfi.id === id);
  return item ? clone(item) : undefined;
}
