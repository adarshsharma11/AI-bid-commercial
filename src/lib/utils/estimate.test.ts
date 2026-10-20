import { describe, expect, it } from "vitest";

import { calculateEstimate, lineTotal } from "@/lib/utils/estimate";

describe("estimate calculations", () => {
  it("prices a line from quantity and unit costs", () => {
    expect(
      lineTotal({
        quantity: 100,
        materialCost: 2.5,
        laborCost: 3.25,
        subcontractorCost: 0,
        otherCost: 0.1,
      }),
    ).toBe(585);
  });

  it("applies markup to the direct total, then contingency to the subtotal", () => {
    const totals = calculateEstimate(
      [
        {
          quantity: 100,
          materialCost: 2.5,
          laborCost: 3.25,
          subcontractorCost: 0,
          otherCost: 0.1,
        },
      ],
      15,
      5,
    );
    expect(totals).toEqual({
      direct: 585,
      markup: 87.75,
      subtotal: 672.75,
      contingency: 33.64,
      total: 706.39,
    });
  });
});
