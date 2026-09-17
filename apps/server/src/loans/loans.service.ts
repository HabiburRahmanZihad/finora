import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { LoanStatus, Prisma, TransactionType } from "@finora/database";
import type { CreateLoanInput, RecordLoanPaymentInput, UpdateLoanInput, UpdateLoanScheduleEntryInput } from "@finora/validation";
import {
  computeInstallmentStatus,
  computeLoanDerived,
  generateLoanSchedule,
  type LoanScheduleRow,
} from "./loan-schedule.util.js";

const UPCOMING_WINDOW_DAYS = 7;

// Destructuring in a function's parameter list (rather than a body-level
// `const { schedule: _x, ...rest } = loan`) keeps eslint's unused-vars
// argsIgnorePattern happy while still dropping the (potentially large)
// schedule array from the list response.
function omitSchedule<T extends { schedule: unknown }>({ schedule: _schedule, ...rest }: T) {
  return rest;
}

// If a PATCH touches any of these, the schedule must be regenerated — and
// that's only allowed while no payment has been recorded yet.
const FINANCIAL_TERM_FIELDS = [
  "principalAmount",
  "hasInterest",
  "interestType",
  "interestValue",
  "interestFrequency",
  "repaymentFrequency",
  "customRepaymentDays",
  "installmentType",
  "startDate",
  "endDate",
] as const;

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      include: { schedule: { orderBy: { installmentNumber: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const soon = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    let totalBorrowed = new Prisma.Decimal(0);
    let totalOutstanding = new Prisma.Decimal(0);
    let totalPaid = new Prisma.Decimal(0);
    let overdueInstallmentCount = 0;
    let upcomingInstallmentCount = 0;
    let activeLoanCount = 0;

    const result = loans.map((loan) => {
      const derived = computeLoanDerived(loan.schedule as LoanScheduleRow[], now);
      const progress = derived.totalPayableOriginal.greaterThan(0)
        ? Math.round(derived.totalPaid.div(derived.totalPayableOriginal).mul(1000).toNumber()) / 10
        : 0;

      totalBorrowed = totalBorrowed.plus(loan.principalAmount);
      totalPaid = totalPaid.plus(derived.totalPaid);
      if (loan.status === LoanStatus.ACTIVE) {
        activeLoanCount++;
        totalOutstanding = totalOutstanding.plus(derived.outstandingPrincipal);
      }
      for (const row of loan.schedule) {
        const status = computeInstallmentStatus(row, now);
        if (status === "OVERDUE") overdueInstallmentCount++;
        else if (status !== "PAID" && row.dueDate <= soon) upcomingInstallmentCount++;
      }

      return {
        ...omitSchedule(loan),
        outstandingPrincipal: derived.outstandingPrincipal.toFixed(2),
        remainingInterest: derived.remainingInterest.toFixed(2),
        totalPayableRemaining: derived.totalPayableRemaining.toFixed(2),
        totalPaid: derived.totalPaid.toFixed(2),
        progress,
        hasOverdue: derived.hasOverdue,
        nextDueInstallment: derived.nextDueInstallment
          ? {
              id: derived.nextDueInstallment.id,
              installmentNumber: derived.nextDueInstallment.installmentNumber,
              dueDate: derived.nextDueInstallment.dueDate,
              totalDue: derived.nextDueInstallment.totalDue,
              amountPaid: derived.nextDueInstallment.amountPaid,
            }
          : null,
      };
    });

    return {
      loans: result,
      summary: {
        totalBorrowed: totalBorrowed.toFixed(2),
        totalOutstanding: totalOutstanding.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        activeLoanCount,
        overdueInstallmentCount,
        upcomingInstallmentCount,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const loan = await this.assertOwned(userId, id);
    const [schedule, payments] = await Promise.all([
      this.prisma.loanRepaymentSchedule.findMany({
        where: { loanId: id },
        orderBy: { installmentNumber: "asc" },
      }),
      this.prisma.loanPayment.findMany({
        where: { loanId: id },
        include: { transaction: { include: { account: true } } },
        orderBy: { paidDate: "desc" },
      }),
    ]);

    const now = new Date();
    const derived = computeLoanDerived(schedule as LoanScheduleRow[], now);
    const progress = derived.totalPayableOriginal.greaterThan(0)
      ? Math.round(derived.totalPaid.div(derived.totalPayableOriginal).mul(1000).toNumber()) / 10
      : 0;

    return {
      ...loan,
      outstandingPrincipal: derived.outstandingPrincipal.toFixed(2),
      remainingInterest: derived.remainingInterest.toFixed(2),
      totalPayableOriginal: derived.totalPayableOriginal.toFixed(2),
      totalPayableRemaining: derived.totalPayableRemaining.toFixed(2),
      totalInterest: derived.totalInterest.toFixed(2),
      totalPaid: derived.totalPaid.toFixed(2),
      progress,
      hasOverdue: derived.hasOverdue,
      schedule: schedule.map((row) => ({ ...row, status: computeInstallmentStatus(row, now) })),
      payments,
    };
  }

  async create(userId: string, input: CreateLoanInput) {
    const schedule = generateLoanSchedule({
      principalAmount: input.principalAmount,
      startDate: input.startDate,
      endDate: input.endDate,
      hasInterest: input.hasInterest,
      interestType: input.hasInterest ? input.interestType : undefined,
      interestValue: input.hasInterest ? input.interestValue : undefined,
      interestFrequency: input.hasInterest ? input.interestFrequency : undefined,
      repaymentFrequency: input.repaymentFrequency,
      customRepaymentDays: input.customRepaymentDays,
    });

    const loan = await this.prisma.loan.create({
      data: {
        userId,
        lenderName: input.lenderName,
        loanType: input.loanType,
        principalAmount: input.principalAmount,
        startDate: input.startDate,
        endDate: input.endDate,
        hasInterest: input.hasInterest,
        interestType: input.hasInterest ? input.interestType : undefined,
        interestValue: input.hasInterest ? input.interestValue : undefined,
        interestFrequency: input.hasInterest ? input.interestFrequency : undefined,
        repaymentFrequency: input.repaymentFrequency,
        customRepaymentDays: input.customRepaymentDays,
        installmentType: input.installmentType,
        totalInstallments: schedule.length,
        note: input.note,
        schedule: {
          createMany: {
            data: schedule.map((row) => ({
              userId,
              installmentNumber: row.installmentNumber,
              dueDate: row.dueDate,
              principalComponent: row.principalComponent,
              interestComponent: row.interestComponent,
              totalDue: row.totalDue,
            })),
          },
        },
      },
    });

    return this.findOne(userId, loan.id);
  }

  async update(userId: string, id: string, input: UpdateLoanInput) {
    const loan = await this.assertOwned(userId, id);

    const touchesFinancialTerms = FINANCIAL_TERM_FIELDS.some(
      (field) => (input as Record<string, unknown>)[field] !== undefined,
    );

    if (touchesFinancialTerms) {
      const paymentCount = await this.prisma.loanPayment.count({ where: { loanId: id } });
      if (paymentCount > 0) {
        throw new BadRequestException(
          "Loan terms can't be changed after payments have been recorded — edit individual installments instead, or delete and recreate the loan.",
        );
      }

      const merged = {
        principalAmount: input.principalAmount ?? loan.principalAmount.toString(),
        startDate: input.startDate ?? loan.startDate,
        endDate: input.endDate ?? loan.endDate,
        hasInterest: input.hasInterest ?? loan.hasInterest,
        interestType: input.interestType !== undefined ? input.interestType : loan.interestType,
        interestValue: input.interestValue !== undefined ? input.interestValue : loan.interestValue?.toString(),
        interestFrequency:
          input.interestFrequency !== undefined ? input.interestFrequency : loan.interestFrequency,
        repaymentFrequency: input.repaymentFrequency ?? loan.repaymentFrequency,
        customRepaymentDays:
          input.customRepaymentDays !== undefined ? input.customRepaymentDays : loan.customRepaymentDays,
      };

      const schedule = generateLoanSchedule({
        ...merged,
        interestType: merged.hasInterest ? merged.interestType : undefined,
        interestValue: merged.hasInterest ? merged.interestValue : undefined,
        interestFrequency: merged.hasInterest ? merged.interestFrequency : undefined,
      });

      await this.prisma.$transaction(async (tx) => {
        await tx.loanRepaymentSchedule.deleteMany({ where: { loanId: id } });
        await tx.loan.update({
          where: { id },
          data: {
            lenderName: input.lenderName,
            loanType: input.loanType,
            note: input.note,
            ...merged,
            interestType: merged.hasInterest ? merged.interestType : null,
            interestValue: merged.hasInterest ? merged.interestValue : null,
            interestFrequency: merged.hasInterest ? merged.interestFrequency : null,
            installmentType: input.installmentType ?? loan.installmentType,
            totalInstallments: schedule.length,
            schedule: {
              createMany: {
                data: schedule.map((row) => ({
                  userId,
                  installmentNumber: row.installmentNumber,
                  dueDate: row.dueDate,
                  principalComponent: row.principalComponent,
                  interestComponent: row.interestComponent,
                  totalDue: row.totalDue,
                })),
              },
            },
          },
        });
      });
    } else {
      await this.prisma.loan.update({
        where: { id },
        data: { lenderName: input.lenderName, loanType: input.loanType, note: input.note },
      });
    }

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.loan.delete({ where: { id } });
    return { success: true };
  }

  async updateScheduleEntry(
    userId: string,
    loanId: string,
    scheduleId: string,
    input: UpdateLoanScheduleEntryInput,
  ) {
    await this.assertOwned(userId, loanId);
    const entry = await this.assertScheduleOwned(userId, loanId, scheduleId);

    if (new Prisma.Decimal(entry.amountPaid).greaterThan(0)) {
      throw new BadRequestException("Can't edit an installment that already has a payment recorded");
    }

    let principalComponent = entry.principalComponent;
    let interestComponent = entry.interestComponent;
    const totalDue = input.totalDue !== undefined ? new Prisma.Decimal(input.totalDue) : entry.totalDue;

    if (input.totalDue !== undefined) {
      const oldTotal = new Prisma.Decimal(entry.totalDue);
      const ratio = oldTotal.greaterThan(0)
        ? new Prisma.Decimal(entry.principalComponent).div(oldTotal)
        : new Prisma.Decimal(1);
      principalComponent = totalDue.times(ratio).toDecimalPlaces(2);
      interestComponent = totalDue.minus(principalComponent);
    }

    await this.prisma.loanRepaymentSchedule.update({
      where: { id: scheduleId },
      data: {
        dueDate: input.dueDate ?? entry.dueDate,
        totalDue,
        principalComponent,
        interestComponent,
      },
    });

    return this.findOne(userId, loanId);
  }

  async recordPayment(userId: string, loanId: string, input: RecordLoanPaymentInput) {
    const loan = await this.assertOwned(userId, loanId);
    const entry = await this.assertScheduleOwned(userId, loanId, input.scheduleId);

    const totalDue = new Prisma.Decimal(entry.totalDue);
    const remaining = totalDue.minus(entry.amountPaid);
    const amount = new Prisma.Decimal(input.amount);

    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Payment amount must be greater than zero");
    }
    if (amount.greaterThan(remaining)) {
      throw new BadRequestException(`Payment exceeds the remaining due (${remaining.toFixed(2)}) for this installment`);
    }

    if (input.accountId) {
      const account = await this.prisma.financialAccount.findUnique({ where: { id: input.accountId } });
      if (!account || account.userId !== userId) {
        throw new NotFoundException("Account not found");
      }
    }

    const paidDate = input.paidDate ?? new Date();

    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.loanPayment.create({
        data: {
          loanId,
          scheduleId: input.scheduleId,
          userId,
          amount: input.amount,
          paidDate,
          note: input.note,
        },
      });

      if (input.accountId) {
        await tx.transaction.create({
          data: {
            userId,
            type: TransactionType.EXPENSE,
            amount: input.amount,
            accountId: input.accountId,
            date: paidDate,
            note: `Loan repayment — ${loan.lenderName} (installment #${entry.installmentNumber})`,
            isLoanPayment: true,
            loanPaymentId: payment.id,
          },
        });
      }

      await tx.loanRepaymentSchedule.update({
        where: { id: input.scheduleId },
        data: { amountPaid: { increment: input.amount } },
      });

      const allRows = await tx.loanRepaymentSchedule.findMany({ where: { loanId } });
      const fullyPaid = allRows.every((row) =>
        new Prisma.Decimal(row.amountPaid).greaterThanOrEqualTo(row.totalDue),
      );
      if (fullyPaid) {
        await tx.loan.update({ where: { id: loanId }, data: { status: LoanStatus.CLOSED } });
      }
    });

    return this.findOne(userId, loanId);
  }

  private async assertOwned(userId: string, id: string) {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    if (!loan || loan.userId !== userId) {
      throw new NotFoundException("Loan not found");
    }
    return loan;
  }

  private async assertScheduleOwned(userId: string, loanId: string, scheduleId: string) {
    const entry = await this.prisma.loanRepaymentSchedule.findUnique({ where: { id: scheduleId } });
    if (!entry || entry.userId !== userId || entry.loanId !== loanId) {
      throw new NotFoundException("Schedule entry not found");
    }
    return entry;
  }
}
