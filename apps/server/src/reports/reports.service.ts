import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { DashboardService } from "../dashboard/dashboard.service.js";
import { Prisma, TransactionType } from "@finora/database";
import { addMonths, endOfMonth, startOfMonth } from "@finora/utils";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}
function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardService: DashboardService,
  ) {}

  private async sumByType(userId: string, type: TransactionType, from: Date, to: Date) {
    const agg = await this.prisma.transaction.aggregate({
      where: { userId, type, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return new Prisma.Decimal(agg._sum.amount ?? 0);
  }

  async getDailyReport(userId: string, date: Date) {
    const from = startOfDay(date);
    const to = endOfDay(date);

    const [income, expense, transactionCount, highestExpense, categoryBreakdown, avgDaily] =
      await Promise.all([
        this.sumByType(userId, TransactionType.INCOME, from, to),
        this.sumByType(userId, TransactionType.EXPENSE, from, to),
        this.prisma.transaction.count({ where: { userId, date: { gte: from, lte: to } } }),
        this.prisma.transaction.findFirst({
          where: { userId, type: TransactionType.EXPENSE, date: { gte: from, lte: to } },
          orderBy: { amount: "desc" },
          include: { category: true },
        }),
        this.dashboardService.getExpenseByCategory(userId, { from, to }),
        this.getAverageDailyExpense(userId, date, 30),
      ]);

    const todaySaving = income.minus(expense);
    const comparisonPercent = avgDaily.greaterThan(0)
      ? Math.round(expense.minus(avgDaily).div(avgDaily).mul(1000).toNumber()) / 10
      : 0;

    return {
      date: from.toISOString(),
      todayIncome: income.toFixed(2),
      todayExpense: expense.toFixed(2),
      todaySaving: todaySaving.toFixed(2),
      transactionCount,
      highestExpense: highestExpense
        ? {
            amount: new Prisma.Decimal(highestExpense.amount).toFixed(2),
            categoryName: highestExpense.category?.name ?? null,
            note: highestExpense.note,
          }
        : null,
      categoryBreakdown,
      averageDailySpending: avgDaily.toFixed(2),
      comparisonPercent,
    };
  }

  private async getAverageDailyExpense(userId: string, before: Date, days: number) {
    const from = startOfDay(new Date(before.getTime() - days * 24 * 60 * 60 * 1000));
    const to = endOfDay(new Date(before.getTime() - 24 * 60 * 60 * 1000));
    const total = await this.sumByType(userId, TransactionType.EXPENSE, from, to);
    return total.div(days);
  }

  async getMonthlyReport(userId: string, year: number, month: number) {
    const monthStart = startOfMonth(new Date(year, month - 1, 1));
    const monthEnd = endOfMonth(monthStart);
    const prevMonthStart = startOfMonth(addMonths(monthStart, -1));
    const prevMonthEnd = endOfMonth(prevMonthStart);

    const [
      income,
      expense,
      prevIncome,
      prevExpense,
      categoryBreakdown,
      budgets,
      dailyExpenses,
      monthlyTrend,
    ] = await Promise.all([
      this.sumByType(userId, TransactionType.INCOME, monthStart, monthEnd),
      this.sumByType(userId, TransactionType.EXPENSE, monthStart, monthEnd),
      this.sumByType(userId, TransactionType.INCOME, prevMonthStart, prevMonthEnd),
      this.sumByType(userId, TransactionType.EXPENSE, prevMonthStart, prevMonthEnd),
      this.dashboardService.getExpenseByCategory(userId, { from: monthStart, to: monthEnd }),
      this.prisma.budget.findMany({ where: { userId }, include: { category: true } }),
      this.prisma.transaction.findMany({
        where: { userId, type: TransactionType.EXPENSE, date: { gte: monthStart, lte: monthEnd } },
        select: { amount: true, date: true },
      }),
      this.getMonthlyTrendAnchored(userId, monthStart, 6),
    ]);

    const totalSaving = income.minus(expense);
    const savingsRate = income.greaterThan(0) ? totalSaving.div(income).mul(100).toNumber() : 0;

    const incomeChangePercent = prevIncome.greaterThan(0)
      ? Math.round(income.minus(prevIncome).div(prevIncome).mul(1000).toNumber()) / 10
      : null;
    const expenseChangePercent = prevExpense.greaterThan(0)
      ? Math.round(expense.minus(prevExpense).div(prevExpense).mul(1000).toNumber()) / 10
      : null;

    const daysInMonth = monthEnd.getDate();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month - 1;
    const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth;
    const avgDailyExpense = expense.div(Math.max(1, elapsedDays));

    const spendByDay = new Map<string, Prisma.Decimal>();
    for (const tx of dailyExpenses) {
      const key = tx.date.toISOString().slice(0, 10);
      spendByDay.set(key, (spendByDay.get(key) ?? new Prisma.Decimal(0)).plus(tx.amount));
    }
    let highestSpendingDay: { date: string; amount: string } | null = null;
    for (const [dayKey, amount] of spendByDay.entries()) {
      if (!highestSpendingDay || amount.greaterThan(highestSpendingDay.amount)) {
        highestSpendingDay = { date: dayKey, amount: amount.toFixed(2) };
      }
    }

    const spendByCategory = new Map(categoryBreakdown.map((c) => [c.categoryId, c.amount]));
    const budgetPerformance = budgets.map((budget) => {
      const spent = spendByCategory.get(budget.categoryId) ?? "0.00";
      const amount = new Prisma.Decimal(budget.amount);
      const ratio = amount.greaterThan(0) ? new Prisma.Decimal(spent).div(amount).toNumber() : 0;
      const status = ratio >= 1 ? "EXCEEDED" : ratio >= 0.8 ? "WARNING" : "NORMAL";
      return { categoryName: budget.category.name, budget: budget.amount.toFixed(2), spent, status };
    });

    return {
      totalIncome: income.toFixed(2),
      totalExpense: expense.toFixed(2),
      totalSaving: totalSaving.toFixed(2),
      savingsRate: Math.round(savingsRate * 10) / 10,
      categoryBreakdown,
      budgetPerformance,
      previousMonthComparison: { incomeChangePercent, expenseChangePercent },
      averageDailyExpense: avgDailyExpense.toFixed(2),
      highestSpendingDay,
      highestSpendingCategory: categoryBreakdown[0] ?? null,
      monthlyTrend,
    };
  }

  private async getMonthlyTrendAnchored(userId: string, anchorMonthStart: Date, months: number) {
    const starts = Array.from({ length: months }, (_, i) =>
      startOfMonth(addMonths(anchorMonthStart, -(months - 1 - i))),
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

  async getYearlyReport(userId: string, year: number) {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(yearStart);

    const [income, expense, categoryBreakdown, monthlyComparison] = await Promise.all([
      this.sumByType(userId, TransactionType.INCOME, yearStart, yearEnd),
      this.sumByType(userId, TransactionType.EXPENSE, yearStart, yearEnd),
      this.dashboardService.getExpenseByCategory(userId, { from: yearStart, to: yearEnd }),
      this.getMonthlyTrendAnchored(userId, startOfMonth(new Date(year, 11, 1)), 12),
    ]);

    const now = new Date();
    const monthsElapsed = year === now.getFullYear() ? now.getMonth() + 1 : 12;
    const annualSaving = income.minus(expense);
    const savingsRate = income.greaterThan(0) ? annualSaving.div(income).mul(100).toNumber() : 0;

    let bestSavingMonth: { month: string; savings: string } | null = null;
    let highestSpendingMonth: { month: string; expense: string } | null = null;
    for (const point of monthlyComparison) {
      if (!bestSavingMonth || Number(point.savings) > Number(bestSavingMonth.savings)) {
        bestSavingMonth = { month: point.month, savings: point.savings };
      }
      if (!highestSpendingMonth || Number(point.expense) > Number(highestSpendingMonth.expense)) {
        highestSpendingMonth = { month: point.month, expense: point.expense };
      }
    }

    return {
      annualIncome: income.toFixed(2),
      annualExpense: expense.toFixed(2),
      annualSaving: annualSaving.toFixed(2),
      averageMonthlyIncome: income.div(monthsElapsed).toFixed(2),
      averageMonthlyExpense: expense.div(monthsElapsed).toFixed(2),
      savingsRate: Math.round(savingsRate * 10) / 10,
      bestSavingMonth,
      highestSpendingMonth,
      categoryBreakdown,
      monthlyComparison,
    };
  }
}
