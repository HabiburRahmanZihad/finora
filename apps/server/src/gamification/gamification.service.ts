import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, SavingGoalStatus, TransactionType } from "@finora/database";
import { endOfMonth, startOfMonth } from "@finora/utils";

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [savingStreakMonths, noSpendStreakDays, noSpendDaysThisMonth, currentMonthSavings, goals, budgetCount] =
      await Promise.all([
        this.getSavingStreakMonths(userId),
        this.getNoSpendStreakDays(userId),
        this.getNoSpendDaysThisMonth(userId),
        this.getCurrentMonthSavings(userId),
        this.prisma.savingGoal.findMany({ where: { userId } }),
        this.prisma.budget.count({ where: { userId } }),
      ]);

    const achievements = [
      {
        id: "no-spend-3",
        title: "3-Day No-Spend Streak",
        description: "Went 3 days in a row without an expense.",
        achieved: noSpendStreakDays >= 3,
      },
      {
        id: "no-spend-7",
        title: "7-Day No-Spend Streak",
        description: "Went 7 days in a row without an expense.",
        achieved: noSpendStreakDays >= 7,
      },
      {
        id: "no-spend-30",
        title: "30-Day No-Spend Streak",
        description: "Went 30 days in a row without an expense.",
        achieved: noSpendStreakDays >= 30,
      },
      {
        id: "saving-streak-3",
        title: "3-Month Saving Streak",
        description: "Saved more than you spent for 3 months running.",
        achieved: savingStreakMonths >= 3,
      },
      {
        id: "saving-streak-6",
        title: "6-Month Saving Streak",
        description: "Saved more than you spent for 6 months running.",
        achieved: savingStreakMonths >= 6,
      },
      {
        id: "saved-10k",
        title: "Saved ৳10,000 this month",
        description: "This month's income minus expense crossed ৳10,000.",
        achieved: currentMonthSavings.greaterThanOrEqualTo(10000),
      },
      {
        id: "saved-50k",
        title: "Saved ৳50,000 this month",
        description: "This month's income minus expense crossed ৳50,000.",
        achieved: currentMonthSavings.greaterThanOrEqualTo(50000),
      },
      {
        id: "first-budget",
        title: "First Budget Set",
        description: "Set your first category budget.",
        achieved: budgetCount > 0,
      },
      {
        id: "goal-completed",
        title: "Goal Achieved",
        description: "Completed a saving goal.",
        achieved: goals.some((g) => g.status === SavingGoalStatus.COMPLETED),
      },
    ];

    return {
      savingStreakMonths,
      noSpendStreakDays,
      noSpendDaysThisMonth,
      achievements,
    };
  }

  private async getCurrentMonthSavings(userId: string): Promise<Prisma.Decimal> {
    const now = new Date();
    const [income, expense] = await Promise.all([
      this.sum(userId, TransactionType.INCOME, startOfMonth(now), endOfMonth(now)),
      this.sum(userId, TransactionType.EXPENSE, startOfMonth(now), endOfMonth(now)),
    ]);
    return income.minus(expense);
  }

  private async sum(userId: string, type: TransactionType, from: Date, to: Date) {
    const agg = await this.prisma.transaction.aggregate({
      where: { userId, type, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return new Prisma.Decimal(agg._sum.amount ?? 0);
  }

  /** Consecutive months (including the current, partial month) where income > expense. */
  private async getSavingStreakMonths(userId: string): Promise<number> {
    const now = new Date();
    let streak = 0;
    for (let i = 0; i < 24; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const [income, expense] = await Promise.all([
        this.sum(userId, TransactionType.INCOME, startOfMonth(monthDate), endOfMonth(monthDate)),
        this.sum(userId, TransactionType.EXPENSE, startOfMonth(monthDate), endOfMonth(monthDate)),
      ]);
      if (income.greaterThan(0) && income.greaterThan(expense)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  /** Consecutive days ending today with zero expense transactions. */
  private async getNoSpendStreakDays(userId: string): Promise<number> {
    const expenseDates = await this.prisma.transaction.findMany({
      where: { userId, type: TransactionType.EXPENSE },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 500,
    });
    const spendDays = new Set(expenseDates.map((t) => t.date.toISOString().slice(0, 10)));

    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const key = cursor.toISOString().slice(0, 10);
      if (spendDays.has(key)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  private async getNoSpendDaysThisMonth(userId: string): Promise<number> {
    const now = new Date();
    const expenseDates = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: startOfMonth(now), lte: now },
      },
      select: { date: true },
    });
    const spendDays = new Set(expenseDates.map((t) => t.date.toISOString().slice(0, 10)));
    return now.getDate() - spendDays.size;
  }
}
