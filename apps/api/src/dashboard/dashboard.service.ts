import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { FinancialAccountsService } from "../financial-accounts/financial-accounts.service.js";
import { Prisma, TransactionType } from "@finora/database";
import type { DashboardQueryInput } from "@finora/validation";
import { endOfMonth, getDateRangeForPreset, startOfMonth } from "@finora/utils";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: FinancialAccountsService,
  ) {}

  resolveRange(query: DashboardQueryInput): { from: Date; to: Date } {
    if (query.preset === "custom" && query.from && query.to) {
      return { from: query.from, to: query.to };
    }
    if (query.preset === "custom") {
      return getDateRangeForPreset("this_month");
    }
    return getDateRangeForPreset(query.preset);
  }

  async getSummary(userId: string, range: { from: Date; to: Date }) {
    const [incomeAgg, expenseAgg, accounts] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, type: TransactionType.INCOME, date: { gte: range.from, lte: range.to } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: TransactionType.EXPENSE, date: { gte: range.from, lte: range.to } },
        _sum: { amount: true },
      }),
      this.accountsService.findAll(userId),
    ]);

    const totalIncome = new Prisma.Decimal(incomeAgg._sum.amount ?? 0);
    const totalExpense = new Prisma.Decimal(expenseAgg._sum.amount ?? 0);
    const totalSavings = totalIncome.minus(totalExpense);
    const savingsRate = totalIncome.greaterThan(0)
      ? totalSavings.div(totalIncome).mul(100).toNumber()
      : 0;

    const totalBalance = accounts
      .filter((a) => a.status === "ACTIVE")
      .reduce((sum, a) => sum.plus(a.currentBalance), new Prisma.Decimal(0));

    return {
      totalBalance: totalBalance.toFixed(2),
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      totalSavings: totalSavings.toFixed(2),
      savingsRate: Math.round(savingsRate * 10) / 10,
    };
  }

  async getExpenseByCategory(userId: string, range: { from: Date; to: Date }) {
    const rows = await this.prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: range.from, lte: range.to },
        categoryId: { not: null },
      },
      _sum: { amount: true },
    });

    const categoryIds = rows.map((r) => r.categoryId).filter((id): id is string => Boolean(id));
    const categories = await this.prisma.category.findMany({ where: { id: { in: categoryIds } } });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return rows
      .map((row) => ({
        categoryId: row.categoryId as string,
        categoryName: categoryMap.get(row.categoryId as string)?.name ?? "Unknown",
        icon: categoryMap.get(row.categoryId as string)?.icon ?? null,
        amount: (row._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
      }))
      .sort((a, b) => Number(b.amount) - Number(a.amount));
  }

  async getMonthlyTrend(userId: string, months: number) {
    const now = new Date();
    const monthStarts = Array.from({ length: months }, (_, i) =>
      startOfMonth(new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)),
    );

    const results = await Promise.all(
      monthStarts.map(async (start) => {
        const end = endOfMonth(start);
        const [incomeAgg, expenseAgg] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: { userId, type: TransactionType.INCOME, date: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
        ]);

        const income = new Prisma.Decimal(incomeAgg._sum.amount ?? 0);
        const expense = new Prisma.Decimal(expenseAgg._sum.amount ?? 0);

        return {
          month: start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          income: income.toFixed(2),
          expense: expense.toFixed(2),
          savings: income.minus(expense).toFixed(2),
        };
      }),
    );

    return results;
  }
}
