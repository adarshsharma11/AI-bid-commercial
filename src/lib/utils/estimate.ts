import { roundCurrency } from "@/lib/utils/currency";

export type CostComponents = {
  materialCost: number;
  laborCost: number;
  subcontractorCost: number;
  otherCost: number;
};

export type EstimateLineInput = CostComponents & {
  quantity: number;
};

export type EstimateTotals = {
  direct: number;
  markup: number;
  subtotal: number;
  contingency: number;
  total: number;
};

export function lineUnitCost(costs: CostComponents): number {
  return roundCurrency(
    costs.materialCost + costs.laborCost + costs.subcontractorCost + costs.otherCost,
  );
}

export function lineTotal(line: EstimateLineInput): number {
  return roundCurrency(line.quantity * lineUnitCost(line));
}

export function applyPercent(base: number, percent: number): number {
  return roundCurrency(base * (percent / 100));
}

export function calculateEstimate(
  lines: EstimateLineInput[],
  markupPercent: number,
  contingencyPercent: number,
): EstimateTotals {
  const direct = roundCurrency(lines.reduce((sum, line) => sum + lineTotal(line), 0));
  const markup = applyPercent(direct, markupPercent);
  const subtotal = roundCurrency(direct + markup);
  const contingency = applyPercent(subtotal, contingencyPercent);
  const total = roundCurrency(subtotal + contingency);
  return { direct, markup, subtotal, contingency, total };
}
