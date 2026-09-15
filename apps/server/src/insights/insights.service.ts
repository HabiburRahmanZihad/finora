import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { InsightSeverity, Prisma, TransactionType } from "@finora/database";
import { addMonths, endOfMonth, startOfMonth } from "@finora/utils";

interface Candidate {
  severity: InsightSeverity;
  title: string;
  message: string;
  category: string | null;
}

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const generatedToday = await this.prisma.financialInsight.count({
      where: { userId, createdAt: { gte: todayStart } },
    });

    if (generatedToday === 0) {
      const candidates = await this.generateCandidates(userId);
      if (candidates.length > 0) {
        await this.prisma.financialInsight.createMany({
          data: candidates.map((c) => ({ userId, ...c })),
        });
      }
    }

    return this.prisma.financialInsight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  async dismiss(userId: string, id: string) {
    const insight = await this.prisma.financialInsight.findUnique({ where: { id } });
    if (!insight || insight.userId !== userId) return { success: false };
    await this.prisma.financialInsight.update({ where: { id }, data: { isDismissed: true } });
    return { success: true };
  }

  private async sumByType(userId: string, type: TransactionType, from: Date, to: Date) {
    const agg = await this.prisma.transaction.aggregate({
      where: { userId, type, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return new Prisma.Decimal(agg._sum.amount ?? 0);
  }

  private async generateCandidates(userId: string): Promise<Candidate[]> {
    const now = new Date();
    const thisStart = startOfMonth(now);
    const thisEnd = endOfMonth(now);
    const prevStart = startOfMonth(addMonths(now, -1));
    const prevEnd = endOfMonth(prevStart);

    const candidates: Candidate[] = [];

    const [income, expense, prevIncome, prevExpense, budgets, currentByCategory, prevByCategory, categories] =
      await Promise.all([
        this.sumByType(userId, TransactionType.INCOME, thisStart, thisEnd),
        this.sumByType(userId, TransactionType.EXPENSE, thisStart, thisEnd),
        this.sumByType(userId, TransactionType.INCOME, prevStart, prevEnd),
        this.sumByType(userId, TransactionType.EXPENSE, prevStart, prevEnd),
        this.prisma.budget.findMany({ where: { userId }, include: { category: true } }),
        this.prisma.transaction.groupBy({
          by: ["categoryId"],
          where: { userId, type: TransactionType.EXPENSE, date: { gte: thisStart, lte: thisEnd }, categoryId: { not: null } },
          _sum: { amount: true },
        }),
        this.prisma.transaction.groupBy({
          by: ["categoryId"],
          where: { userId, type: TransactionType.EXPENSE, date: { gte: prevStart, lte: prevEnd }, categoryId: { not: null } },
          _sum: { amount: true },
        }),
        this.prisma.category.findMany({ where: { OR: [{ userId: null }, { userId }] } }),
      ]);

    const categoryName = new Map(categories.map((c) => [c.id, c.name]));
    const prevSpendMap = new Map(
      prevByCategory.map((r) => [r.categoryId as string, new Prisma.Decimal(r._sum.amount ?? 0)]),
    );

    // R1 / R6 — category spend spikes and drops vs previous month.
    for (const row of currentByCategory) {
      const catId = row.categoryId as string;
      const current = new Prisma.Decimal(row._sum.amount ?? 0);
      const previous = prevSpendMap.get(catId);
      const name = categoryName.get(catId) ?? "A category";
      if (!previous || previous.lessThanOrEqualTo(0)) continue;

      const ratio = current.div(previous).toNumber();
      if (ratio >= 1.2) {
        const pct = Math.round((ratio - 1) * 1000) / 10;
        candidates.push({
          severity: InsightSeverity.WARNING,
          title: `${name} spending increased`,
          message: `${name} spending increased ${pct}% compared to last month.`,
          category: name,
        });
      } else if (ratio <= 0.8) {
        const pct = Math.round((1 - ratio) * 1000) / 10;
        candidates.push({
          severity: InsightSeverity.POSITIVE,
          title: `${name} spending decreased`,
          message: `${name} spending decreased ${pct}% compared to last month.`,
          category: name,
        });
      }
    }

    // R2 / R7 — budget exceeded / warning.
    for (const budget of budgets) {
      const spent = new Prisma.Decimal(
        currentByCategory.find((r) => r.categoryId === budget.categoryId)?._sum.amount ?? 0,
      );
      const amount = new Prisma.Decimal(budget.amount);
      if (amount.lessThanOrEqualTo(0)) continue;
      const ratio = spent.div(amount).toNumber();

      if (ratio >= 1) {
        const over = spent.minus(amount);
        candidates.push({
          severity: InsightSeverity.CRITICAL,
          title: `${budget.category.name} budget exceeded`,
          message: `You exceeded your ${budget.category.name} budget by ৳${over.toFixed(2)}.`,
          category: budget.category.name,
        });
      } else if (ratio >= 0.8) {
        candidates.push({
          severity: InsightSeverity.WARNING,
          title: `${budget.category.name} budget warning`,
          message: `You've used ${Math.round(ratio * 100)}% of your ${budget.category.name} budget this month.`,
          category: budget.category.name,
        });
      }
    }

    // R3 — savings rate below target.
    if (income.greaterThan(0)) {
      const savingsRate = income.minus(expense).div(income).mul(100).toNumber();
      if (savingsRate < 20) {
        candidates.push({
          severity: InsightSeverity.WARNING,
          title: "Savings rate below target",
          message: `Your current savings rate is ${Math.round(savingsRate * 10) / 10}%, below the recommended 20%.`,
          category: null,
        });
      }
    }

    // R4 — spending pace higher than last month's average.
    const daysElapsed = now.getDate();
    const daysInPrevMonth = prevEnd.getDate();
    if (prevExpense.greaterThan(0) && daysElapsed > 0) {
      const currentDailyRate = expense.div(daysElapsed);
      const previousDailyRate = prevExpense.div(daysInPrevMonth);
      if (currentDailyRate.greaterThan(previousDailyRate.mul(1.1))) {
        candidates.push({
          severity: InsightSeverity.WARNING,
          title: "Spending pace is up",
          message: "Your current spending rate may cause month-end overspending compared to last month.",
          category: null,
        });
      }
    }

    // R5 — savings improved.
    if (prevIncome.greaterThan(0)) {
      const currentSavings = income.minus(expense);
      const prevSavings = prevIncome.minus(prevExpense);
      if (prevSavings.greaterThan(0) && currentSavings.greaterThan(prevSavings.mul(1.1))) {
        const pct = Math.round(currentSavings.minus(prevSavings).div(prevSavings).mul(1000).toNumber()) / 10;
        candidates.push({
          severity: InsightSeverity.POSITIVE,
          title: "Savings improved",
          message: `Savings improved by ${pct}% compared to last month.`,
          category: null,
        });
      }
    }

    return candidates;
  }
}
