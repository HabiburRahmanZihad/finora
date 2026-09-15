// Re-export Prisma's generated enums so both apps import domain types from
// one place. Computed / UI-only types (never persisted as-is) live below.
export {
  AccountType,
  AccountStatus,
  CategoryType,
  CategoryStatus,
  TransactionType,
  PaymentMethod,
  BillingCycle,
  SubscriptionStatus,
  RecurrenceFrequency,
  RecurringStatus,
  NotificationType,
  InsightSeverity,
  SavingGoalStatus,
} from "@finora/database";

/** Computed at query time from Budget.amount vs current-month spend — not stored. */
export type BudgetStatus = "NORMAL" | "WARNING" | "EXCEEDED";

export const BUDGET_WARNING_THRESHOLD = 0.8;
export const BUDGET_EXCEEDED_THRESHOLD = 1.0;

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
