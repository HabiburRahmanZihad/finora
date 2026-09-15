/**
 * Formats a non-negative or negative integer/decimal string using the South
 * Asian (lakh/crore) grouping used for BDT/INR, e.g. 150000 -> "1,50,000".
 * Implemented by hand rather than via Intl locale data, which may not be
 * available in every Node build (small-icu).
 */
export function formatSouthAsianNumber(value: number): string {
  const isNegative = value < 0;
  const [intPart, decPart] = Math.abs(value).toFixed(2).split(".");
  const lastThree = intPart.slice(-3);
  const other = intPart.slice(0, -3);
  const formattedOther = other === "" ? "" : other.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ",";
  return `${isNegative ? "-" : ""}${formattedOther}${lastThree}.${decPart}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

export function formatCurrency(amount: number | string, currency = "BDT"): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";

  if (currency === "BDT" || currency === "INR") {
    return `${symbol}${formatSouthAsianNumber(value)}`;
  }

  return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
