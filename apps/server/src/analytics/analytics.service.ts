import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, TransactionType } from "@finora/database";
import { addMonths, endOfMonth, startOfMonth } from "@finora/utils";

function percentChange(current: Prisma.Decimal, previous: Prisma.Decimal): number | null {
  if (previous.equals(0)) return null;
  return Math.round(current.minus(previous).div(previous).mul(1000).toNumber()) / 10;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private async sumByType(userId: string, type: TransactionType, from: Date, to: Date) {
    const agg = await this.prisma.transaction.aggregate({
      where: { userId, type, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return new Prisma.Decimal(agg._sum.amount ?? 0);
  }

  private async getMonthlyTrend(userId: string, months: number) {
    const now = new Date();
    const starts = Array.from({ length: months }, (_, i) =>
      startOfMonth(addMonths(now, -(months - 1 - i))),
    );
    return Promise.all(
      starts.map(async (start) => {
        const end = endOfMonth(start);
        const [income, expense] = await Promise.all([
          this.sumByType(userId, TransactionType.INCOME, start, end),
          this.sumByType(userId, TransactionType.EXPENSE, start, end),
        ]);
        return {
          month: start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          income: income.toFixed(2),
          expense: expense.toFixed(2),
          savings: income.minus(expense).toFixed(2),
        };
      }),
    );
  }

  async getSpendingAnalytics(userId: string) {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(addMonths(now, -1));
    const prevMonthEnd = endOfMonth(prevMonthStart);

    const [currentExpense, previousExpense, transactions, trend3, trend6, trendYearly] =
      await Promise.all([
        this.sumByType(userId, TransactionType.EXPENSE, thisMonthStart, thisMonthEnd),
        this.sumByType(userId, TransactionType.EXPENSE, prevMonthStart, prevMonthEnd),
        this.prisma.transaction.findMany({
          where: { userId, type: TransactionType.EXPENSE, date: { gte: thisMonthStart, lte: thisMonthEnd } },
          select: { amount: true, date: true },
        }),
        this.getMonthlyTrend(userId, 3),
        this.getMonthlyTrend(userId, 6),
        this.getMonthlyTrend(userId, 12),
      ]);

    const daysElapsed = now.getDate();
    const averageDailySpending = currentExpense.div(Math.max(1, daysElapsed));
    const spendingFrequency =
      transactions.length > 0 ? Math.round((transactions.length / daysElapsed) * 100) / 100 : 0;

    const byDay = new Map<string, Prisma.Decimal>();
    let weekday = new Prisma.Decimal(0);
    let weekend = new Prisma.Decimal(0);
    for (const tx of transactions) {
      const key = tx.date.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? new Prisma.Decimal(0)).plus(tx.amount));
      const dow = tx.date.getDay();
      if (dow === 0 || dow === 6) weekend = weekend.plus(tx.amount);
      else weekday = weekday.plus(tx.amount);
    }
    let highestSpendingDay: { date: string; amount: string } | null = null;
    for (const [date, amount] of byDay.entries()) {
      if (!highestSpendingDay || amount.greaterThan(highestSpendingDay.amount)) {
        highestSpendingDay = { date, amount: amount.toFixed(2) };
      }
    }

    return {
      currentMonthExpense: currentExpense.toFixed(2),
      previousMonthExpense: previousExpense.toFixed(2),
      changePercent: percentChange(currentExpense, previousExpense),
      averageDailySpending: averageDailySpending.toFixed(2),
      spendingFrequency,
      highestSpendingDay,
      weekdayVsWeekend: { weekday: weekday.toFixed(2), weekend: weekend.toFixed(2) },
      trend3Month: trend3,
      trend6Month: trend6,
      trendYearly,
    };
  }

  async getSavingsAnalytics(userId: string) {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(addMonths(now, -1));
    const prevMonthEnd = endOfMonth(prevMonthStart);

    const [currentIncome, currentExpense, prevIncome, prevExpense, trend6] = await Promise.all([
      this.sumByType(userId, TransactionType.INCOME, thisMonthStart, thisMonthEnd),
      this.sumByType(userId, TransactionType.EXPENSE, thisMonthStart, thisMonthEnd),
      this.sumByType(userId, TransactionType.INCOME, prevMonthStart, prevMonthEnd),
      this.sumByType(userId, TransactionType.EXPENSE, prevMonthStart, prevMonthEnd),
      this.getMonthlyTrend(userId, 6),
    ]);

    const currentSavings = currentIncome.minus(currentExpense);
    const previousSavings = prevIncome.minus(prevExpense);
    const incomeGrowth = percentChange(currentIncome, prevIncome);

    return {
      currentMonthSavings: currentSavings.toFixed(2),
      previousMonthSavings: previousSavings.toFixed(2),
      savingsGrowthPercent: percentChange(currentSavings, previousSavings),
      incomeGrowthPercent: incomeGrowth,
      savingsRateTrend: trend6.map((point) => ({
        month: point.month,
        savingsRate:
          Number(point.income) > 0
            ? Math.round((Number(point.savings) / Number(point.income)) * 1000) / 10
            : 0,
      })),
    };
  }

  async getCategoryAnalytics(userId: string) {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(addMonths(now, -1));
    const prevMonthEnd = endOfMonth(prevMonthStart);

    const [currentRows, prevRows, categories] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: thisMonthStart, lte: thisMonthEnd },
          categoryId: { not: null },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: prevMonthStart, lte: prevMonthEnd },
          categoryId: { not: null },
        },
        _sum: { amount: true },
      }),
      this.prisma.category.findMany({
        where: { OR: [{ userId: null }, { userId }] },
      }),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const prevMap = new Map(
      prevRows.map((r) => [r.categoryId as string, new Prisma.Decimal(r._sum.amount ?? 0)]),
    );

    const result = currentRows
      .map((row) => {
        const current = new Prisma.Decimal(row._sum.amount ?? 0);
        const previous = prevMap.get(row.categoryId as string) ?? new Prisma.Decimal(0);
        return {
          categoryId: row.categoryId as string,
          categoryName: categoryMap.get(row.categoryId as string) ?? "Unknown",
          currentMonthAmount: current.toFixed(2),
          previousMonthAmount: previous.toFixed(2),
          changePercent: percentChange(current, previous),
        };
      })
      .sort((a, b) => Number(b.currentMonthAmount) - Number(a.currentMonthAmount));

    return {
      categories: result,
      highestSpendingCategory: result[0] ?? null,
    };
  }
}
