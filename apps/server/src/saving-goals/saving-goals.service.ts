import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, SavingGoalStatus } from "@finora/database";
import type {
  ContributeSavingGoalInput,
  CreateSavingGoalInput,
  UpdateSavingGoalInput,
} from "@finora/validation";
import { addMonths } from "@finora/utils";

const CONTRIBUTION_LOOKBACK_MONTHS = 3;

@Injectable()
export class SavingGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return Promise.all(goals.map((goal) => this.withComputedFields(goal)));
  }

  async findOne(userId: string, id: string) {
    const goal = await this.assertOwned(userId, id);
    return this.withComputedFields(goal);
  }

  create(userId: string, input: CreateSavingGoalInput) {
    return this.prisma.savingGoal.create({
      data: {
        userId,
        name: input.name,
        icon: input.icon,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount,
        targetDate: input.targetDate,
      },
    });
  }

  async update(userId: string, id: string, input: UpdateSavingGoalInput) {
    await this.assertOwned(userId, id);
    return this.prisma.savingGoal.update({
      where: { id },
      data: {
        name: input.name,
        icon: input.icon,
        targetAmount: input.targetAmount,
        targetDate: input.targetDate,
        status: input.status,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.savingGoal.delete({ where: { id } });
    return { success: true };
  }

  async contribute(userId: string, id: string, input: ContributeSavingGoalInput) {
    const goal = await this.assertOwned(userId, id);
    const newAmount = new Prisma.Decimal(goal.currentAmount).plus(input.amount);
    const isComplete = newAmount.greaterThanOrEqualTo(goal.targetAmount);

    const [, updated] = await this.prisma.$transaction([
      this.prisma.savingGoalContribution.create({
        data: { savingGoalId: id, userId, amount: input.amount, note: input.note },
      }),
      this.prisma.savingGoal.update({
        where: { id },
        data: {
          currentAmount: newAmount,
          status: isComplete ? SavingGoalStatus.COMPLETED : goal.status,
        },
      }),
    ]);

    return this.withComputedFields(updated);
  }

  private async assertOwned(userId: string, id: string) {
    const goal = await this.prisma.savingGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException("Saving goal not found");
    }
    return goal;
  }

  private async withComputedFields(goal: {
    id: string;
    targetAmount: Prisma.Decimal;
    currentAmount: Prisma.Decimal;
    targetDate: Date | null;
    createdAt: Date;
    [key: string]: unknown;
  }) {
    const target = new Prisma.Decimal(goal.targetAmount);
    const current = new Prisma.Decimal(goal.currentAmount);
    const remaining = Prisma.Decimal.max(target.minus(current), 0);
    const progress = target.greaterThan(0)
      ? Math.round(current.div(target).mul(1000).toNumber()) / 10
      : 0;

    const since = new Date();
    since.setMonth(since.getMonth() - CONTRIBUTION_LOOKBACK_MONTHS);
    const lookbackStart = since > goal.createdAt ? since : goal.createdAt;

    const contributions = await this.prisma.savingGoalContribution.aggregate({
      where: { savingGoalId: goal.id, date: { gte: lookbackStart } },
      _sum: { amount: true },
    });

    const monthsElapsed = Math.max(
      1,
      (Date.now() - lookbackStart.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    const currentSavingRate = new Prisma.Decimal(contributions._sum.amount ?? 0).div(monthsElapsed);

    let requiredMonthlySaving: string | null = null;
    if (goal.targetDate && remaining.greaterThan(0)) {
      const monthsRemaining = Math.max(
        1,
        Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
      );
      requiredMonthlySaving = remaining.div(monthsRemaining).toFixed(2);
    }

    let estimatedCompletionDate: string | null = null;
    if (remaining.lessThanOrEqualTo(0)) {
      estimatedCompletionDate = new Date().toISOString();
    } else if (currentSavingRate.greaterThan(0)) {
      const monthsNeeded = Math.ceil(remaining.div(currentSavingRate).toNumber());
      estimatedCompletionDate = addMonths(new Date(), monthsNeeded).toISOString();
    } else if (goal.targetDate) {
      estimatedCompletionDate = goal.targetDate.toISOString();
    }

    return {
      ...goal,
      progress,
      remaining: remaining.toFixed(2),
      currentSavingRate: currentSavingRate.toFixed(2),
      requiredMonthlySaving,
      estimatedCompletionDate,
    };
  }
}
