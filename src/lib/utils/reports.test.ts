import { describe, expect, it } from "vitest";

import { buildReport, viewReport } from "@/lib/utils/reports";
import type { GeneralContractor, Project } from "@/types/domain";

const now = new Date("2026-10-21T15:00:00.000Z");

const contractors: Pick<GeneralContractor, "id" | "name">[] = [
  { id: "gc_a", name: "Ridgeline" },
  { id: "gc_b", name: "Harpeth" },
];

function project(overrides: Partial<Project>): Project {
  return {
    id: "prj_1",
    name: "Tower",
    number: "SC-1",
    location: "1 Main",
    city: "Nashville",
    state: "TN",
    trade: "painting",
    status: "won",
    gcId: "gc_a",
    gcContactName: "",
    gcContactEmail: "",
    gcContactPhone: "",
    ownerId: "usr_avery",
    estimatedValue: 1000,
    bidDueAt: "2026-10-20T20:00:00.000Z",
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
    samplePreconHours: 2,
    createdAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("report filters", () => {
  it("recalculates win rate from the filtered demo rows", () => {
    const summary = buildReport(
      [
        project({ id: "paint", trade: "painting", status: "won", gcId: "gc_a" }),
        project({
          id: "dry",
          trade: "drywall",
          status: "lost",
          gcId: "gc_b",
          estimatedValue: 500,
        }),
      ],
      contractors,
      "90",
      now,
    );
    expect(summary.wins).toBe(1);
    expect(summary.losses).toBe(1);
    const painting = viewReport(summary, { trade: "painting", gcId: "all" });
    expect(painting.wins).toBe(1);
    expect(painting.losses).toBe(0);
    expect(painting.winRate).toBe(1);
    expect(painting.byContractor.map((row) => row.name)).toEqual(["Ridgeline"]);
    const empty = viewReport(summary, { trade: "carpentry", gcId: "all" });
    expect(empty.bidsSubmitted).toBe(0);
    expect(empty.valueByMonth).toEqual([]);
  });
});
