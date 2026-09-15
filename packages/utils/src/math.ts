export function percentage(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10; // one decimal place
}

export function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
