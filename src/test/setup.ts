import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

import { setMockLatency } from "@/lib/api/latency";
import { resetDatabase } from "@/mocks/repository";

setMockLatency(0);

beforeEach(() => {
  resetDatabase(new Date("2026-10-21T15:00:00.000Z"));
});
