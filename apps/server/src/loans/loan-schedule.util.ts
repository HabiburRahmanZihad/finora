import { Prisma, LoanInterestType, LoanInterestFrequency, LoanRepaymentFrequency } from "@finora/database";
import type { LoanPaymentStatus } from "@finora/types";

// Calendar-based periods-per-year, used only for interest-rate conversion
// (not for date-stepping — addPeriod below uses real calendar arithmetic).
const PERIODS_PER_YEAR: Record<string, number> = {
  DAILY: 365,
  WEEKLY: 52,
  BI_WEEKLY: 26,
  MONTHLY: 12,
  QUARTERLY: 4,
  YEARLY: 1,
};

// Safety bound so a malformed date range can't loop forever — mirrors the
// capped catch-up loop in recurring-transactions.service.ts.
const MAX_INSTALLMENTS = 1200;

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function addPeriod(
  date: Date,
  frequency: LoanRepaymentFrequency,
  customDays?: number | null,
): Date {
  const next = new Date(date);
  switch (frequency) {
    case LoanRepaymentFrequency.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case LoanRepaymentFrequency.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case LoanRepaymentFrequency.BI_WEEKLY:
      next.setDate(next.getDate() + 14);
      break;
    case LoanRepaymentFrequency.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case LoanRepaymentFrequency.QUARTERLY:
      next.setMonth(next.getMonth() + 3);
      break;
    case LoanRepaymentFrequency.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
    case LoanRepaymentFrequency.CUSTOM:
      next.setDate(next.getDate() + (customDays ?? 30));
      break;
    case LoanRepaymentFrequency.ONE_TIME:
      break;
  }
  return next;
}

function countPeriods(
  startDate: Date,
  endDate: Date,
  frequency: LoanRepaymentFrequency,
  customDays?: number | null,
): number {
  if (frequency === LoanRepaymentFrequency.ONE_TIME) return 1;
  let cursor = new Date(startDate);
  let count = 0;
  while (cursor < endDate && count < MAX_INSTALLMENTS) {
    cursor = addPeriod(cursor, frequency, customDays);
    count++;
  }
  return Math.max(count, 1);
}

function computeDueDates(
  startDate: Date,
  endDate: Date,
  frequency: LoanRepaymentFrequency,
  customDays: number | null | undefined,
  count: number,
): Date[] {
  if (frequency === LoanRepaymentFrequency.ONE_TIME) return [new Date(endDate)];
  const dates: Date[] = [];
  let cursor = new Date(startDate);
  for (let i = 0; i < count; i++) {
    cursor = addPeriod(cursor, frequency, customDays);
    // Pin the final due date exactly to endDate so the schedule always
    // terminates on the loan's actual end date, even when period-length
    // arithmetic (e.g. monthly steps) wouldn't land exactly there.
    dates.push(i === count - 1 ? new Date(endDate) : new Date(cursor));
  }
  return dates;
}

function periodsPerYear(
  frequency: LoanRepaymentFrequency | LoanInterestFrequency,
  customDays: number | null | undefined,
  termDays: number,
): number {
  // A single period spanning the whole term, expressed as a fraction of a year.
  if (frequency === "ONE_TIME") return 365 / termDays;
  if (frequency === "CUSTOM") return 365 / (customDays ?? 30);
  return PERIODS_PER_YEAR[frequency] ?? 12;
}

/**
 * Converts a rate quoted at `sourceFrequency` (e.g. 12% yearly) into the
 * equivalent simple rate per `targetFrequency` period (e.g. per month), via
 * the ratio of calendar periods-per-year — so "12% yearly, repaid monthly"
 * converts to exactly 1%/month, matching the standard EMI convention (rather
 * than a day-count approximation, which would drift slightly off 1% because
 * 12 months of 30 days ≠ 365 days). ONE_TIME/CUSTOM periods (which have no
 * fixed calendar length) fall back to a day-count fraction of a year.
 */
function convertRatePerPeriod(
  ratePercent: number,
  sourceFrequency: LoanInterestFrequency,
  targetFrequency: LoanRepaymentFrequency,
  targetCustomDays: number | null | undefined,
  termDays: number,
): number {
  const sourcePeriodsPerYear = periodsPerYear(sourceFrequency, undefined, termDays);
  const targetPeriodsPerYear = periodsPerYear(targetFrequency, targetCustomDays, termDays);
  return (ratePercent / 100) * (sourcePeriodsPerYear / targetPeriodsPerYear);
}

interface ScheduleAmounts {
  principalComponent: Prisma.Decimal;
  interestComponent: Prisma.Decimal;
  totalDue: Prisma.Decimal;
}

export interface GeneratedInstallment extends ScheduleAmounts {
  installmentNumber: number;
  dueDate: Date;
}

/** Equal split of principal and (optionally zero) interest across n installments. Last installment absorbs rounding so the sums are exact to the cent. */
function generateFlatSchedule(
  principal: Prisma.Decimal,
  totalInterest: Prisma.Decimal,
  count: number,
): ScheduleAmounts[] {
  const basePrincipal = principal.dividedBy(count).toDecimalPlaces(2);
  const baseInterest = totalInterest.dividedBy(count).toDecimalPlaces(2);

  let remainingPrincipal = principal;
  let remainingInterest = totalInterest;
  const rows: ScheduleAmounts[] = [];

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const principalComponent = isLast ? remainingPrincipal : basePrincipal;
    const interestComponent = isLast ? remainingInterest : baseInterest;
    rows.push({ principalComponent, interestComponent, totalDue: principalComponent.plus(interestComponent) });
    remainingPrincipal = remainingPrincipal.minus(principalComponent);
    remainingInterest = remainingInterest.minus(interestComponent);
  }
  return rows;
}

/** Standard reducing-balance (EMI) amortization: interest accrues on the outstanding balance each period. */
function generateEmiSchedule(
  principal: Prisma.Decimal,
  periodicRate: number,
  count: number,
): ScheduleAmounts[] {
  let balance = principal;

  const emi =
    periodicRate <= 0
      ? principal.dividedBy(count).toDecimalPlaces(2)
      : new Prisma.Decimal(
          ((principal.toNumber() * periodicRate * Math.pow(1 + periodicRate, count)) /
            (Math.pow(1 + periodicRate, count) - 1)
          ).toFixed(2),
        );

  const rows: ScheduleAmounts[] = [];
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const interestComponent =
      periodicRate <= 0 ? new Prisma.Decimal(0) : balance.times(periodicRate).toDecimalPlaces(2);
    const principalComponent = isLast
      ? balance
      : Prisma.Decimal.max(Prisma.Decimal.min(emi.minus(interestComponent), balance), 0);
    const totalDue = principalComponent.plus(interestComponent);
    rows.push({ principalComponent, interestComponent, totalDue });
    balance = balance.minus(principalComponent);
  }
  return rows;
}

export interface GenerateLoanScheduleInput {
  principalAmount: string | number | Prisma.Decimal;
  startDate: Date;
  endDate: Date;
  hasInterest: boolean;
  interestType?: LoanInterestType | null;
  interestValue?: string | number | Prisma.Decimal | null;
  interestFrequency?: LoanInterestFrequency | null;
  repaymentFrequency: LoanRepaymentFrequency;
  customRepaymentDays?: number | null;
}

/** The core amortization engine — generates the full installment schedule for a loan up front. Pure, no DB access. */
export function generateLoanSchedule(input: GenerateLoanScheduleInput): GeneratedInstallment[] {
  const principal = new Prisma.Decimal(input.principalAmount);
  const count = countPeriods(input.startDate, input.endDate, input.repaymentFrequency, input.customRepaymentDays);
  const dueDates = computeDueDates(
    input.startDate,
    input.endDate,
    input.repaymentFrequency,
    input.customRepaymentDays,
    count,
  );
  const termDays = Math.max(daysBetween(input.startDate, input.endDate), 1);

  let rows: ScheduleAmounts[];

  if (!input.hasInterest || !input.interestType) {
    rows = generateFlatSchedule(principal, new Prisma.Decimal(0), count);
  } else if (input.interestType === LoanInterestType.PERCENTAGE) {
    const periodicRate = convertRatePerPeriod(
      Number(input.interestValue ?? 0),
      input.interestFrequency ?? LoanInterestFrequency.MONTHLY,
      input.repaymentFrequency,
      input.customRepaymentDays,
      termDays,
    );
    rows = generateEmiSchedule(principal, periodicRate, count);
  } else {
    const interestPeriods = countPeriods(
      input.startDate,
      input.endDate,
      input.interestFrequency ?? LoanInterestFrequency.MONTHLY,
      undefined,
    );
    const totalInterest = new Prisma.Decimal(input.interestValue ?? 0).times(interestPeriods);
    rows = generateFlatSchedule(principal, totalInterest, count);
  }

  return rows.map((row, i) => ({ installmentNumber: i + 1, dueDate: dueDates[i] ?? input.endDate, ...row }));
}

interface InstallmentLike {
  totalDue: Prisma.Decimal | string;
  amountPaid: Prisma.Decimal | string;
  dueDate: Date;
}

/** Computed at read time from totalDue/amountPaid/dueDate vs now — never stored, so it can't go stale. */
export function computeInstallmentStatus(row: InstallmentLike, now: Date = new Date()): LoanPaymentStatus {
  const totalDue = new Prisma.Decimal(row.totalDue);
  const amountPaid = new Prisma.Decimal(row.amountPaid);
  const remaining = totalDue.minus(amountPaid);
  if (remaining.lessThanOrEqualTo(0)) return "PAID";
  if (row.dueDate < now) return "OVERDUE";
  if (amountPaid.greaterThan(0)) return "PARTIALLY_PAID";
  return "PENDING";
}

export interface LoanScheduleRow extends InstallmentLike {
  id: string;
  installmentNumber: number;
  principalComponent: Prisma.Decimal | string;
  interestComponent: Prisma.Decimal | string;
}

/**
 * Loan-level totals derived purely from its schedule rows (never stored, so
 * there's no separately-mutated running balance to drift out of sync).
 * Follows the standard amortization convention that each installment's
 * payment is applied to its own interest first, then its principal.
 *
 * Deliberately sums `principalComponent`/`interestComponent` from the
 * schedule itself rather than trusting `Loan.principalAmount` — once a user
 * edits an individual installment's amount ("custom due dates ও amounts"),
 * the schedule's actual principal/interest split can legitimately diverge
 * from the loan's original nominal principal, and these totals need to
 * reflect what the current schedule actually demands, not what was true at
 * creation time.
 */
export function computeLoanDerived(schedule: LoanScheduleRow[], now: Date = new Date()) {
  let totalPrincipal = new Prisma.Decimal(0);
  let totalInterest = new Prisma.Decimal(0);
  let totalPaid = new Prisma.Decimal(0);
  let principalPaid = new Prisma.Decimal(0);
  let interestPaid = new Prisma.Decimal(0);
  let hasOverdue = false;
  let nextDueInstallment: LoanScheduleRow | null = null;

  for (const row of schedule) {
    const principalComponent = new Prisma.Decimal(row.principalComponent);
    const interestComponent = new Prisma.Decimal(row.interestComponent);
    const amountPaid = new Prisma.Decimal(row.amountPaid);
    const totalDue = new Prisma.Decimal(row.totalDue);

    totalPrincipal = totalPrincipal.plus(principalComponent);
    totalInterest = totalInterest.plus(interestComponent);
    totalPaid = totalPaid.plus(amountPaid);

    const iPaid = Prisma.Decimal.min(amountPaid, interestComponent);
    interestPaid = interestPaid.plus(iPaid);
    principalPaid = principalPaid.plus(amountPaid.minus(iPaid));

    if (computeInstallmentStatus(row, now) === "OVERDUE") hasOverdue = true;
    if (!nextDueInstallment && amountPaid.lessThan(totalDue)) nextDueInstallment = row;
  }

  const outstandingPrincipal = Prisma.Decimal.max(totalPrincipal.minus(principalPaid), 0);
  const remainingInterest = Prisma.Decimal.max(totalInterest.minus(interestPaid), 0);
  const totalPayableOriginal = totalPrincipal.plus(totalInterest);
  const totalPayableRemaining = Prisma.Decimal.max(totalPayableOriginal.minus(totalPaid), 0);

  return {
    totalInterest,
    totalPaid,
    outstandingPrincipal,
    remainingInterest,
    totalPayableOriginal,
    totalPayableRemaining,
    hasOverdue,
    nextDueInstallment,
  };
}
