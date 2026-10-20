import { describe, expect, it } from "vitest";

import { queryProjects } from "@/lib/utils/projects";
import type { GeneralContractor, Project, User } from "@/types/domain";

const now = new Date("2026-10-21T15:00:00.000Z");

const users: User[] = [
  {
    id: "usr_avery",
    name: "Avery Lang",
    email: "avery.lang@summitcoatings.example",
    role: "precon_lead",
    title: "Precon",
  },
];

const contractors: GeneralContractor[] = [
  {
    id: "gc_ridgeline",
    name: "Ridgeline Builders",
    category: "GC",
    city: "Nashville",
    state: "TN",
    phone: "",
    email: "",
    website: "",
    primaryContact: "",
    notes: "",
    insuranceOnFile: true,
    insuranceExpiresOn: null,
    projectsBid: 1,
    winRate: null,
    paymentHistory: "current",
  },
];

function project(overrides: Partial<Project>): Project {
  return {
    id: "prj_1",
    name: "The Gulch Office Tower",
    number: "SC-1",
    location: "1200 Division Street",
    city: "Nashville",
    state: "TN",
    trade: "painting",
    status: "pricing",
    gcId: "gc_ridgeline",
    gcContactName: "",
    gcContactEmail: "",
    gcContactPhone: "",
    ownerId: "usr_avery",
    estimatedValue: 1000,
    bidDueAt: "2026-10-23T20:00:00.000Z",
    timezone: "America/Chicago",
    siteVisitAt: null,
    rfiDueAt: null,
    aiRecommendation: "go",
    aiScore: 80,
    aiRationale: "",
    humanDecision: null,
    humanDecisionNote: null,
    humanDecisionBy: null,
    nextAction: "Price",
    nextActionDueAt: null,
    documentCompleteness: 80,
    samplePreconHours: 1,
    createdAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("project filtering", () => {
  const projects = [
    project({ id: "prj_gulch", status: "pricing" }),
    project({
      id: "prj_franklin",
      name: "Franklin Civic Center",
      status: "no_go",
      city: "Franklin",
    }),
  ];

  it("filters by status and search", () => {
    const pricing = queryProjects(
      projects,
      contractors,
      users,
      { status: "pricing" },
      now,
    );
    expect(pricing.items.map((item) => item.id)).toEqual(["prj_gulch"]);

    const search = queryProjects(
      projects,
      contractors,
      users,
      { search: "franklin" },
      now,
    );
    expect(search.total).toBe(1);
    expect(search.items[0]?.gcName).toBe("Ridgeline Builders");
  });

  it("sorts by estimated value descending and paginates", () => {
    const result = queryProjects(
      projects,
      contractors,
      users,
      { sort: "estimatedValue", direction: "desc", page: 1, pageSize: 1 },
      now,
    );
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(1);
  });
});
