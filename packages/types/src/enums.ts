/**
 * Hand-mirrored copies of the enums in packages/database/prisma/schema.prisma.
 *
 * These are intentionally NOT re-exported from @finora/database: that package
 * eagerly instantiates PrismaClient (Node-only, needs `fs`/native bindings),
 * so pulling enums from it would drag the Prisma runtime into browser
 * bundles via @finora/types / @finora/validation. Keep the string values in
 * sync with schema.prisma when either changes.
 */

export const AccountType = {
  CASH: "CASH",
  BANK: "BANK",
  MOBILE_WALLET: "MOBILE_WALLET",
  CREDIT_CARD: "CREDIT_CARD",
  SAVINGS: "SAVINGS",
  OTHER: "OTHER",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const CategoryType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;
export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export const CategoryStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;
export type CategoryStatus = (typeof CategoryStatus)[keyof typeof CategoryStatus];

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentMethod = {
  CASH: "CASH",
  BANK: "BANK",
  CARD: "CARD",
  MOBILE_WALLET: "MOBILE_WALLET",
  OTHER: "OTHER",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const BillingCycle = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const;
export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle];

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const RecurrenceFrequency = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  CUSTOM: "CUSTOM",
} as const;
export type RecurrenceFrequency = (typeof RecurrenceFrequency)[keyof typeof RecurrenceFrequency];

export const RecurringStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  ENDED: "ENDED",
} as const;
export type RecurringStatus = (typeof RecurringStatus)[keyof typeof RecurringStatus];

export const NotificationType = {
  BUDGET_WARNING: "BUDGET_WARNING",
  BUDGET_EXCEEDED: "BUDGET_EXCEEDED",
  UPCOMING_RECURRING: "UPCOMING_RECURRING",
  SAVING_GOAL_REMINDER: "SAVING_GOAL_REMINDER",
  SUBSCRIPTION_REMINDER: "SUBSCRIPTION_REMINDER",
  FINANCIAL_INSIGHT: "FINANCIAL_INSIGHT",
  MONTHLY_REPORT_AVAILABLE: "MONTHLY_REPORT_AVAILABLE",
  LOAN_PAYMENT_DUE: "LOAN_PAYMENT_DUE",
  LOAN_PAYMENT_OVERDUE: "LOAN_PAYMENT_OVERDUE",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const InsightSeverity = {
  POSITIVE: "POSITIVE",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
} as const;
export type InsightSeverity = (typeof InsightSeverity)[keyof typeof InsightSeverity];

export const SavingGoalStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;
export type SavingGoalStatus = (typeof SavingGoalStatus)[keyof typeof SavingGoalStatus];

export const LoanType = {
  PERSONAL: "PERSONAL",
  BANK: "BANK",
  CREDIT_CARD: "CREDIT_CARD",
  FRIEND_FAMILY: "FRIEND_FAMILY",
  MORTGAGE: "MORTGAGE",
  VEHICLE: "VEHICLE",
  STUDENT: "STUDENT",
  BUSINESS: "BUSINESS",
  OTHER: "OTHER",
} as const;
export type LoanType = (typeof LoanType)[keyof typeof LoanType];

export const LoanInterestType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;
export type LoanInterestType = (typeof LoanInterestType)[keyof typeof LoanInterestType];

export const LoanInterestFrequency = {
  ONE_TIME: "ONE_TIME",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const;
export type LoanInterestFrequency = (typeof LoanInterestFrequency)[keyof typeof LoanInterestFrequency];

export const LoanRepaymentFrequency = {
  ONE_TIME: "ONE_TIME",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  BI_WEEKLY: "BI_WEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
  CUSTOM: "CUSTOM",
} as const;
export type LoanRepaymentFrequency = (typeof LoanRepaymentFrequency)[keyof typeof LoanRepaymentFrequency];

export const LoanInstallmentType = {
  FIXED: "FIXED",
  VARIABLE: "VARIABLE",
} as const;
export type LoanInstallmentType = (typeof LoanInstallmentType)[keyof typeof LoanInstallmentType];

export const LoanStatus = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
} as const;
export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];
