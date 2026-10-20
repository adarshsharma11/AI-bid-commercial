const wholeDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const exactDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return wholeDollar.format(value);
}

export function formatCurrencyExact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return exactDollar.format(value);
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
