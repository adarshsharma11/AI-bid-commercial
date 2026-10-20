import { describe, expect, it } from "vitest";

import { newProjectSchema, takeoffItemSchema } from "@/types/schemas";

describe("form schemas", () => {
  it("requires a project name and contractor", () => {
    const result = newProjectSchema.safeParse({
      name: "A",
      location: "",
      city: "Nashville",
      trade: "painting",
      gcId: "",
      bidDueAt: "",
      estimatedValue: null,
      ownerId: "usr_avery",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name?.[0]).toMatch(/project name/i);
      expect(result.error.flatten().fieldErrors.gcId?.[0]).toMatch(/general contractor/i);
    }
  });

  it("rejects a zero takeoff quantity", () => {
    const result = takeoffItemSchema.safeParse({
      quantity: 0,
      assumptions: "Sample",
      exclusions: "None",
    });
    expect(result.success).toBe(false);
  });
});
