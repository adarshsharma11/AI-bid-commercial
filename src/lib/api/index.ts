import { simulate } from "@/lib/api/latency";
import * as repo from "@/mocks/repository";
import type {
  Estimate,
  InboxType,
  NewProjectInput,
  ProjectListQuery,
  Proposal,
  ReportRange,
  Role,
  ScopeStatus,
  SubmissionOutcome,
  Workspace,
} from "@/types/domain";

export const projectsApi = {
  list: (query: ProjectListQuery, signal?: AbortSignal) =>
    simulate(repo.listProjects(query, new Date()), signal),
  getById: (id: string, signal?: AbortSignal) => simulate(repo.getProject(id), signal),
  create: (input: NewProjectInput, role: Role) =>
    simulate(repo.createProject(input, repo.actorForRole(role))),
  decide: (id: string, decision: "go" | "no_go", note: string, role: Role) =>
    simulate(repo.decideGoNoGo(id, decision, note, repo.actorForRole(role))),
};

export const dashboardApi = {
  getSummary: (signal?: AbortSignal) => simulate(repo.getDashboard(new Date()), signal),
};

export const documentsApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.listDocuments(projectId), signal),
  updateReview: (
    documentId: string,
    reviewStatus: "unreviewed" | "in_review" | "reviewed",
    role: Role,
  ) =>
    simulate(
      repo.updateDocumentReview(documentId, reviewStatus, repo.actorForRole(role)),
    ),
};

export const scopeApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.listScope(projectId), signal),
  update: (
    id: string,
    input: { status: ScopeStatus; riskNote: string | null; aiFinding: string },
    role: Role,
  ) => simulate(repo.updateScopeItem(id, input, repo.actorForRole(role))),
  approve: (id: string, role: Role) =>
    simulate(repo.approveScopeItem(id, repo.actorForRole(role))),
};

export const takeoffsApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.listTakeoff(projectId), signal),
  update: (
    id: string,
    input: { quantity: number; assumptions: string; exclusions: string },
    role: Role,
  ) => simulate(repo.updateTakeoffItem(id, input, repo.actorForRole(role))),
  approve: (projectId: string, role: Role) =>
    simulate(repo.approveTakeoff(projectId, repo.actorForRole(role))),
};

export const rfisApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.listRfis(projectId), signal),
  save: (id: string, input: { question: string; reason: string }, role: Role) =>
    simulate(repo.saveRfi(id, input, repo.actorForRole(role))),
  send: (id: string, role: Role) => simulate(repo.sendRfi(id, repo.actorForRole(role))),
};

export const quotesApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.listQuotes(projectId), signal),
  select: (quoteId: string, role: Role) =>
    simulate(repo.selectQuote(quoteId, repo.actorForRole(role))),
};

export const estimatesApi = {
  get: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.getEstimate(projectId), signal),
  update: (
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
    role: Role,
  ) => simulate(repo.updateEstimate(projectId, input, repo.actorForRole(role))),
  setBidPrice: (projectId: string, bidPrice: number, role: Role) =>
    simulate(repo.setBidPrice(projectId, bidPrice, repo.actorForRole(role))),
};

export const proposalsApi = {
  get: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.getProposal(projectId), signal),
  update: (projectId: string, sections: Proposal["sections"], role: Role) =>
    simulate(repo.updateProposal(projectId, sections, repo.actorForRole(role))),
  acknowledge: (projectId: string, addendumId: string, role: Role) =>
    simulate(repo.acknowledgeAddendum(projectId, addendumId, repo.actorForRole(role))),
  approve: (projectId: string, role: Role) =>
    simulate(repo.approveProposal(projectId, repo.actorForRole(role))),
};

export const submissionsApi = {
  get: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.getSubmission(projectId), signal),
  submit: (projectId: string, role: Role) =>
    simulate(repo.submitBid(projectId, repo.actorForRole(role))),
  recordOutcome: (
    projectId: string,
    outcome: Extract<SubmissionOutcome, "won" | "lost">,
    note: string,
    role: Role,
  ) => simulate(repo.recordOutcome(projectId, outcome, note, repo.actorForRole(role))),
};

export const activityApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    simulate(repo.listActivity(projectId), signal),
};

export const subcontractorsApi = {
  list: (search: string, signal?: AbortSignal) =>
    simulate(repo.listSubcontractors(search), signal),
  save: (input: Parameters<typeof repo.saveSubcontractor>[0]) =>
    simulate(repo.saveSubcontractor(input)),
  quotes: (id: string, signal?: AbortSignal) =>
    simulate(repo.quotesForSubcontractor(id), signal),
  projects: (id: string, signal?: AbortSignal) =>
    simulate(repo.projectsForCompany("sub", id), signal),
};

export const generalContractorsApi = {
  list: (search: string, signal?: AbortSignal) =>
    simulate(repo.listGeneralContractors(search), signal),
  save: (input: Parameters<typeof repo.saveGeneralContractor>[0]) =>
    simulate(repo.saveGeneralContractor(input)),
  projects: (id: string, signal?: AbortSignal) =>
    simulate(repo.projectsForCompany("gc", id), signal),
};

export const inboxApi = {
  list: (type: InboxType | "all", signal?: AbortSignal) =>
    simulate(repo.listInbox(type), signal),
  review: (id: string) => simulate(repo.reviewInbox(id)),
  match: (id: string, projectId: string) => simulate(repo.matchInbox(id, projectId)),
};

export const notificationsApi = {
  list: (signal?: AbortSignal) => simulate(repo.listNotifications(), signal),
  markRead: (id: string) => simulate(repo.markNotificationRead(id)),
};

export const reportsApi = {
  get: (range: ReportRange, signal?: AbortSignal) =>
    simulate(repo.getReport(range, new Date()), signal),
};

export const workspaceApi = {
  get: (signal?: AbortSignal) => simulate(repo.getWorkspace(), signal),
  update: (input: Partial<Workspace>) => simulate(repo.updateWorkspace(input)),
  users: (signal?: AbortSignal) => simulate(repo.listUsers(), signal),
  addUser: (input: { name: string; email: string; role: Role; title: string }) =>
    simulate(repo.addUser(input)),
  reference: (signal?: AbortSignal) => simulate(repo.listReferenceData(), signal),
};
