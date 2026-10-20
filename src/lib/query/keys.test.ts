import { describe, expect, it } from "vitest";

import { queryKeys } from "@/lib/query/keys";

describe("query keys", () => {
  it("changes the project list key when filters change", () => {
    const first = queryKeys.projects.list({ status: "pricing", search: "gulch" });
    const second = queryKeys.projects.list({ status: "won", search: "gulch" });
    expect(first).not.toEqual(second);
    expect(first[0]).toBe("projects");
    expect(queryKeys.projects.detail("prj_gulch")).toEqual([
      "projects",
      "detail",
      "prj_gulch",
    ]);
  });
});
