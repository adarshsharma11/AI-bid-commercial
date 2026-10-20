import { describe, expect, it } from "vitest";

import { recommendFromScore, scoreGoNoGo } from "@/lib/utils/go-no-go";

describe("go/no-go scoring", () => {
  it("weights criteria and maps the score to a recommendation", () => {
    const score = scoreGoNoGo([
      { score: 80, weight: 20 },
      { score: 50, weight: 20 },
    ]);
    expect(score).toBe(65);
    expect(recommendFromScore(score)).toBe("review");
    expect(recommendFromScore(82)).toBe("go");
    expect(recommendFromScore(30)).toBe("no_go");
    expect(scoreGoNoGo([])).toBe(0);
  });
});
