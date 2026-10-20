import type { ProjectListQuery, ReportRange } from "@/types/domain";

export const queryKeys = {
  dashboard: {
    all: () => ["dashboard"] as const,
    summary: () => ["dashboard", "summary"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    list: (query: ProjectListQuery) => ["projects", "list", query] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },
  documents: {
    all: () => ["documents"] as const,
    list: (projectId: string) => ["documents", projectId] as const,
  },
  scope: {
    list: (projectId: string) => ["scope", projectId] as const,
  },
  takeoffs: {
    list: (projectId: string) => ["takeoffs", projectId] as const,
  },
  rfis: {
    list: (projectId: string) => ["rfis", projectId] as const,
  },
  quotes: {
    list: (projectId: string) => ["quotes", projectId] as const,
  },
  estimates: {
    detail: (projectId: string) => ["estimates", projectId] as const,
  },
  proposals: {
    detail: (projectId: string) => ["proposals", projectId] as const,
  },
  submissions: {
    detail: (projectId: string) => ["submissions", projectId] as const,
  },
  activity: {
    list: (projectId: string) => ["activity", projectId] as const,
  },
  subcontractors: {
    all: () => ["subcontractors"] as const,
    list: (search: string) => ["subcontractors", search] as const,
  },
  generalContractors: {
    all: () => ["general-contractors"] as const,
    list: (search: string) => ["general-contractors", search] as const,
  },
  inbox: {
    all: () => ["inbox"] as const,
    list: (type: string) => ["inbox", type] as const,
  },
  notifications: {
    list: () => ["notifications"] as const,
  },
  reports: {
    detail: (range: ReportRange) => ["reports", range] as const,
  },
  workspace: {
    detail: () => ["workspace"] as const,
  },
  users: {
    list: () => ["users"] as const,
  },
};
