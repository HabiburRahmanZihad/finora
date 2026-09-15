import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, SavingGoalStatus, TransactionType } from "@finora/database";
import { endOfMonth, startOfMonth } from "@finora/utils";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

@Injectable()
export class HealthScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async getScore(userId: string) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [income, expense, budgets, budgetSpend, activeGoals, sixMonthExpense] = await Promise.all([
      this.sum(userId, TransactionType.INCOME, monthStart, monthEnd),
      this.sum(userId, TransactionType.EXPENSE, monthStart, monthEnd),
      this.prisma.budget.findMany({ where: { userId } }),
      this.prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { userId, type: TransactionType.EXPENSE, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.savingGoal.findMany({ where: { userId, status: SavingGoalStatus.ACTIVE } }),
      this.getLastSixMonthsExpense(userId),
    ]);

    // 1. Savings rate (0% -> 0, 30%+ -> 100), weight 30
    const savingsRate = income.greaterThan(0)
      ? income.minus(expense).div(income).mul(100).toNumber()
      : 0;
    const savingsRateScore = clamp((savingsRate / 30) * 100);

    // 2. Expense/income ratio (<=70% -> 100, >=100% -> 0), weight 25
    const expenseRatio = income.greaterThan(0) ? expense.div(income).toNumber() : 1;
    const expenseRatioScore = clamp(100 - ((expenseRatio - 0.7) / 0.3) * 100);

    // 3. Budget performance (% of budgets not exceeded), weight 20
    const spendByCategory = new Map(
      budgetSpend.map((r) => [r.categoryId as string, new Prisma.Decimal(r._sum.amount ?? 0)]),
    );
    const budgetPerformanceScore =
      budgets.length === 0
        ? 70
        : clamp(
            (budgets.filter((b) => {
              const spent = spendByCategory.get(b.categoryId) ?? new Prisma.Decimal(0);
              return spent.lessThan(b.amount);
            }).length /
              budgets.length) *
              100,
          );

    // 4. Spending stability — coefficient of variation of last 6 months' expenses, weight 15
    const amounts = sixMonthExpense.map((v) => v.toNumber()).filter((v) => v > 0);
    let stabilityScore = 70;
    if (amounts.length >= 2) {
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((a, b) => a + (b - mean) ** 2, 0) / amounts.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
      stabilityScore = clamp(100 - cv * 100);
    }

    // 5. Saving goal progress — average progress across active goals, weight 10
    const goalProgressScore =
      activeGoals.length === 0
        ? 70
        : clamp(
            activeGoals.reduce((sum, g) => {
              const progress = new Prisma.Decimal(g.targetAmount).greaterThan(0)
                ? new Prisma.Decimal(g.currentAmount).div(g.targetAmount).mul(100).toNumber()
                : 0;
              return sum + progress;
            }, 0) / activeGoals.length,
          );

    const weights = {
      savingsRate: 0.3,
      expenseRatio: 0.25,
      budgetPerformance: 0.2,
      stability: 0.15,
      goalProgress: 0.1,
    };

    const overall = Math.round(
      savingsRateScore * weights.savingsRate +
        expenseRatioScore * weights.expenseRatio +
        budgetPerformanceScore * weights.budgetPerformance +
        stabilityScore * weights.stability +
        goalProgressScore * weights.goalProgress,
    );

    return {
      score: clamp(overall, 0, 100),
      breakdown: {
        savingsRate: { score: Math.round(savingsRateScore), weight: weights.savingsRate },
        expenseToIncomeRatio: { score: Math.round(expenseRatioScore), weight: weights.expenseRatio },
        budgetPerformance: { score: Math.round(budgetPerformanceScore), weight: weights.budgetPerformance },
        spendingStability: { score: Math.round(stabilityScore), weight: weights.stability },
        savingGoalProgress: { score: Math.round(goalProgressScore), weight: weights.goalProgress },
      },
      note: "Recurring expense load will be added to this score once recurring transactions ship.",
    };
  }

  private async sum(userId: string, type: TransactionType, from: Date, to: Date) {
    const agg = await this.prisma.transaction.aggregate({
      where: { userId, type, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return new Prisma.Decimal(agg._sum.amount ?? 0);
  }

  private async getLastSixMonthsExpense(userId: string): Promise<Prisma.Decimal[]> {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { start: startOfMonth(d), end: endOfMonth(d) };
    });
    return Promise.all(months.map(({ start, end }) => this.sum(userId, TransactionType.EXPENSE, start, end)));
  }
}
