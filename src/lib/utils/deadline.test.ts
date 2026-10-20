import { describe, expect, it } from "vitest";

import { chicagoDateTime } from "@/lib/utils/dates";
import { classifyDeadline, isDueThisWeek } from "@/lib/utils/deadline";

const now = new Date("2026-10-21T15:00:00.000Z");

describe("deadline classification", () => {
  it("marks past Chicago dates overdue and today separately from soon", () => {
    expect(classifyDeadline(chicagoDateTime(now, -1, 15), now)).toBe("overdue");
    expect(classifyDeadline(chicagoDateTime(now, 0, 16), now)).toBe("today");
    expect(classifyDeadline(chicagoDateTime(now, 2, 15), now)).toBe("soon");
    expect(classifyDeadline(chicagoDateTime(now, 10, 15), now)).toBe("upcoming");
    expect(classifyDeadline(null, now)).toBe("none");
  });

  it("keeps this week inside the current Chicago week", () => {
    expect(isDueThisWeek(chicagoDateTime(now, 2, 15), now)).toBe(true);
    expect(isDueThisWeek(chicagoDateTime(now, -1, 15), now)).toBe(false);
  });
});
