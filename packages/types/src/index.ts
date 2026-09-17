// Domain enums, mirrored from schema.prisma (see ./enums.ts for why this
// isn't just a re-export from @finora/database). Computed / UI-only types
// (never persisted as-is) live below.
export * from "./enums.js";

/** Computed at query time from Budget.amount vs current-month spend — not stored. */
export type BudgetStatus = "NORMAL" | "WARNING" | "EXCEEDED";

export const BUDGET_WARNING_THRESHOLD = 0.8;
export const BUDGET_EXCEEDED_THRESHOLD = 1.0;

/** Computed at query time from LoanRepaymentSchedule.totalDue/amountPaid/dueDate vs now — not stored. */
export type LoanPaymentStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export type TimeFilter =
  | { preset: "today" | "this_week" | "this_month" | "this_year" }
  | { preset: "custom"; from: string; to: string };

export interface DashboardSummary {
  totalBalance: string;
  totalIncome: string;
  totalExpense: string;
  totalSavings: string;
  savingsRate: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
