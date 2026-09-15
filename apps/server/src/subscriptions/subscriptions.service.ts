import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { BillingCycle, Prisma, SubscriptionStatus } from "@finora/database";
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from "@finora/validation";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: { category: true, account: true },
      orderBy: { nextBillingDate: "asc" },
    });

    let monthlyCost = new Prisma.Decimal(0);
    let yearlyCost = new Prisma.Decimal(0);
    for (const sub of subscriptions) {
      if (sub.status !== SubscriptionStatus.ACTIVE) continue;
      const amount = new Prisma.Decimal(sub.amount);
      if (sub.billingCycle === BillingCycle.MONTHLY) {
        monthlyCost = monthlyCost.plus(amount);
        yearlyCost = yearlyCost.plus(amount.mul(12));
      } else {
        monthlyCost = monthlyCost.plus(amount.div(12));
        yearlyCost = yearlyCost.plus(amount);
      }
    }

    return {
      subscriptions,
      summary: { monthlyCost: monthlyCost.toFixed(2), yearlyCost: yearlyCost.toFixed(2) },
    };
  }

  create(userId: string, input: CreateSubscriptionInput) {
    return this.prisma.subscription.create({
      data: {
        userId,
        name: input.name,
        amount: input.amount,
        billingCycle: input.billingCycle,
        nextBillingDate: input.nextBillingDate,
        categoryId: input.categoryId,
        accountId: input.accountId,
        note: input.note,
      },
      include: { category: true, account: true },
    });
  }

  async update(userId: string, id: string, input: UpdateSubscriptionInput) {
    await this.assertOwned(userId, id);
    return this.prisma.subscription.update({
      where: { id },
      data: {
        name: input.name,
        amount: input.amount,
        billingCycle: input.billingCycle,
        nextBillingDate: input.nextBillingDate,
        categoryId: input.categoryId,
        accountId: input.accountId,
        status: input.status,
        note: input.note,
      },
      include: { category: true, account: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.subscription.delete({ where: { id } });
    return { success: true };
  }

  private async assertOwned(userId: string, id: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.userId !== userId) {
      throw new NotFoundException("Subscription not found");
    }
    return sub;
  }
}
