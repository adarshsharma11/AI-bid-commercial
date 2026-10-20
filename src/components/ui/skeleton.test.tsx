import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

describe("skeletons", () => {
  it("uses a pulse that reduced motion can turn off", () => {
    render(<Skeleton />);
    expect(document.querySelector(".motion-reduce\\:animate-none")).toBeTruthy();
    expect(document.querySelector(".motion-safe\\:animate-pulse")).toBeTruthy();
  });

  it("exposes a table loading status", () => {
    render(<SkeletonTable label="Loading pipeline" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading pipeline");
  });
});
