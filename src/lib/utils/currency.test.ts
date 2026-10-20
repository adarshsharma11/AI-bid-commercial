import { describe, expect, it } from "vitest";

import { formatCurrency, formatCurrencyExact, roundCurrency } from "@/lib/utils/currency";

describe("currency", () => {
  it("rounds half-up to cents", () => {
    expect(roundCurrency(33.6375)).toBe(33.64);
    expect(roundCurrency(1.005)).toBe(1.01);
  });

  it("formats whole dollars and exact cents", () => {
    expect(formatCurrency(486000)).toBe("$486,000");
    expect(formatCurrencyExact(706.39)).toBe("$706.39");
    expect(formatCurrency(null)).toBe("—");
  });
});
