import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, TransactionType } from "@finora/database";
import { BUDGET_EXCEEDED_THRESHOLD, BUDGET_WARNING_THRESHOLD, type BudgetStatus } from "@finora/types";
import type { CreateBudgetInput, UpdateBudgetInput } from "@finora/validation";
import { endOfMonth, startOfMonth } from "@finora/utils";

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });

    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const spend = await this.prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: start, lte: end },
        categoryId: { in: budgets.map((b) => b.categoryId) },
      },
      _sum: { amount: true },
    });
    const spendMap = new Map(spend.map((s) => [s.categoryId, new Prisma.Decimal(s._sum.amount ?? 0)]));

    return budgets.map((budget) => {
      const currentSpend = spendMap.get(budget.categoryId) ?? new Prisma.Decimal(0);
      const amount = new Prisma.Decimal(budget.amount);
      const progress = amount.greaterThan(0)
        ? Math.round(currentSpend.div(amount).mul(1000).toNumber()) / 10
        : 0;

      let status: BudgetStatus = "NORMAL";
      if (amount.greaterThan(0)) {
        const ratio = currentSpend.div(amount).toNumber();
        if (ratio >= BUDGET_EXCEEDED_THRESHOLD) status = "EXCEEDED";
        else if (ratio >= BUDGET_WARNING_THRESHOLD) status = "WARNING";
      }

      return {
        ...budget,
        currentSpend: currentSpend.toFixed(2),
        progress,
        status,
      };
    });
  }

  async create(userId: string, input: CreateBudgetInput) {
    const category = await this.prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category || (category.userId !== null && category.userId !== userId)) {
      throw new NotFoundException("Category not found");
    }

    const existing = await this.prisma.budget.findUnique({
      where: { userId_categoryId: { userId, categoryId: input.categoryId } },
    });
    if (existing) {
      throw new ConflictException("A budget already exists for this category — edit it instead");
    }

    return this.prisma.budget.create({
      data: { userId, categoryId: input.categoryId, amount: input.amount },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, input: UpdateBudgetInput) {
    await this.assertOwned(userId, id);
    return this.prisma.budget.update({
      where: { id },
      data: { amount: input.amount },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.budget.delete({ where: { id } });
    return { success: true };
  }

  private async assertOwned(userId: string, id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget || budget.userId !== userId) {
      throw new NotFoundException("Budget not found");
    }
    return budget;
  }
}
