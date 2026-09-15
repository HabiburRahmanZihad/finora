import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, TransactionType } from "@finora/database";
import { addMonths, endOfMonth, startOfMonth } from "@finora/utils";
import type { WhatIfInput } from "@finora/validation";

@Injectable()
export class ForecastService {
  constructor(private readonly prisma: PrismaService) {}

  async getExpenseForecast(userId: string) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = monthEnd.getDate();
    const daysElapsed = now.getDate();

    const agg = await this.prisma.transaction.aggregate({
      where: { userId, type: TransactionType.EXPENSE, date: { gte: monthStart, lte: now } },
      _sum: { amount: true },
    });
    const currentExpense = new Prisma.Decimal(agg._sum.amount ?? 0);
    const dailyRate = currentExpense.div(Math.max(1, daysElapsed));
    const estimatedMonthEnd = dailyRate.mul(daysInMonth);

    return {
      currentDate: now.toISOString(),
      daysElapsed,
      daysInMonth,
      currentExpense: currentExpense.toFixed(2),
      averageDailyRate: dailyRate.toFixed(2),
      estimatedMonthEndExpense: estimatedMonthEnd.toFixed(2),
    };
  }

  async runWhatIf(userId: string, input: WhatIfInput) {
    const category = await this.prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category || (category.userId !== null && category.userId !== userId)) {
      throw new NotFoundException("Category not found");
    }

    const now = new Date();
    const lookbackMonths = 3;
    const from = startOfMonth(addMonths(now, -(lookbackMonths - 1)));
    const to = endOfMonth(now);

    const agg = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        categoryId: input.categoryId,
        date: { gte: from, lte: to },
      },
      _sum: { amount: true },
    });

    const monthsSpanned = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth()) + 1;
    const currentMonthlyAverage = new Prisma.Decimal(agg._sum.amount ?? 0).div(monthsSpanned);
    const newMonthlyAmount = currentMonthlyAverage.mul(1 + input.percentChange / 100);
    const monthlySaving = currentMonthlyAverage.minus(newMonthlyAmount);
    const yearlySaving = monthlySaving.mul(12);

    return {
      categoryName: category.name,
      currentMonthlyAmount: currentMonthlyAverage.toFixed(2),
      percentChange: input.percentChange,
      newMonthlyAmount: newMonthlyAmount.toFixed(2),
      monthlySaving: monthlySaving.toFixed(2),
      yearlySaving: yearlySaving.toFixed(2),
    };
  }
}
