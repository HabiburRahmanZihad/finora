/**
 * Color tokens ported 1:1 from apps/client/src/app/globals.css's `:root`
 * block (plain hex values there, so no translation needed). Keep in sync by
 * hand if the web palette changes — see spec §32.
 */
export const colors = {
  background: "#ffffff",
  foreground: "#101828",

  card: "#ffffff",
  cardForeground: "#101828",

  surface: "#f6f8fb",

  primary: "#0f2c59",
  primaryForeground: "#ffffff",

  secondary: "#eaf2ff",
  secondaryForeground: "#0f2c59",

  accent: "#3b82f6",
  accentForeground: "#ffffff",

  muted: "#f1f5f9",
  mutedForeground: "#64748b",

  border: "#e2e8f0",
  ring: "#3b82f6",

  success: "#16a34a",
  successForeground: "#ffffff",
  warning: "#d97706",
  warningForeground: "#ffffff",
  danger: "#dc2626",
  dangerForeground: "#ffffff",
} as const;

export const radius = {
  sm: 7,
  md: 12,
  lg: 14,
  xl: 18,
} as const;

export const spacing = (n: number) => n * 4;
