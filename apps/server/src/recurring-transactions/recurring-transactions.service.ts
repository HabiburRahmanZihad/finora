import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { RecurrenceFrequency, RecurringStatus } from "@finora/database";
import type {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "@finora/validation";

function computeNextRunDate(from: Date, frequency: RecurrenceFrequency, customInterval?: number | null): Date {
  const next = new Date(from);
  switch (frequency) {
    case RecurrenceFrequency.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case RecurrenceFrequency.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case RecurrenceFrequency.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case RecurrenceFrequency.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
    case RecurrenceFrequency.CUSTOM:
      next.setDate(next.getDate() + (customInterval ?? 30));
      break;
  }
  return next;
}

@Injectable()
export class RecurringTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    await this.processDue(userId);
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      include: { category: true, account: true },
      orderBy: { nextRunDate: "asc" },
    });
  }

  async getUpcoming(userId: string, days: number) {
    await this.processDue(userId);
    const to = new Date();
    to.setDate(to.getDate() + days);
    return this.prisma.recurringTransaction.findMany({
      where: { userId, status: RecurringStatus.ACTIVE, nextRunDate: { lte: to } },
      include: { category: true, account: true },
      orderBy: { nextRunDate: "asc" },
    });
  }

  create(userId: string, input: CreateRecurringTransactionInput) {
    return this.prisma.recurringTransaction.create({
      data: {
        userId,
        type: input.type,
        amount: input.amount,
        categoryId: input.categoryId,
        accountId: input.accountId,
        frequency: input.frequency,
        customInterval: input.customInterval,
        startDate: input.startDate,
        endDate: input.endDate,
        nextRunDate: input.startDate,
        note: input.note,
      },
      include: { category: true, account: true },
    });
  }

  async update(userId: string, id: string, input: UpdateRecurringTransactionInput) {
    await this.assertOwned(userId, id);
    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        amount: input.amount,
        categoryId: input.categoryId,
        accountId: input.accountId,
        endDate: input.endDate,
        status: input.status,
        note: input.note,
      },
      include: { category: true, account: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.recurringTransaction.delete({ where: { id } });
    return { success: true };
  }

  /** Generates the actual Transaction rows for any recurring definition that's come due. */
  private async processDue(userId: string) {
    const now = new Date();
    const due = await this.prisma.recurringTransaction.findMany({
      where: { userId, status: RecurringStatus.ACTIVE, nextRunDate: { lte: now } },
    });

    for (const recurring of due) {
      let cursor = recurring.nextRunDate;
      let runsGenerated = 0;

      // Catch up (capped) in case the app wasn't opened for a while.
      while (cursor <= now && runsGenerated < 60) {
        if (recurring.endDate && cursor > recurring.endDate) break;

        await this.prisma.transaction.create({
          data: {
            userId,
            type: recurring.type,
            amount: recurring.amount,
            date: cursor,
            categoryId: recurring.categoryId,
            accountId: recurring.accountId,
            note: recurring.note ?? undefined,
            isRecurring: true,
            recurringTransactionId: recurring.id,
          },
        });

        cursor = computeNextRunDate(cursor, recurring.frequency, recurring.customInterval);
        runsGenerated++;
      }

      const isEnded = recurring.endDate ? cursor > recurring.endDate : false;
      await this.prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          nextRunDate: cursor,
          status: isEnded ? RecurringStatus.ENDED : RecurringStatus.ACTIVE,
        },
      });
    }
  }

  private async assertOwned(userId: string, id: string) {
    const recurring = await this.prisma.recurringTransaction.findUnique({ where: { id } });
    if (!recurring || recurring.userId !== userId) {
      throw new NotFoundException("Recurring transaction not found");
    }
    return recurring;
  }
}
