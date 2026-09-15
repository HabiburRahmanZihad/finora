// Validated categorical palette (dataviz skill, light mode) — fixed order, never cycled.
// node scripts/validate_palette.js passed all checks for this 8-slot order.
export const categoricalPalette = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
];

export const chartInk = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  gridline: "#e1e0d9",
  baseline: "#c3c2b7",
  otherSlice: "#c3c2b7",
};

// Income/Expense are cash-flow direction, not arbitrary categories — use status tones.
export const flowColors = {
  income: "#0ca30c", // status good
  expense: "#d03b3b", // status critical
  savings: "#2a78d6", // categorical slot 1 (primary blue) — single distinct trend line
};
