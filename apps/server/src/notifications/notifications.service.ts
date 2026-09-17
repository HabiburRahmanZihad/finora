import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { NotificationType, Prisma } from "@finora/database";

interface Candidate {
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const generatedToday = await this.prisma.notification.count({
      where: { userId, createdAt: { gte: todayStart } },
    });

    if (generatedToday === 0) {
      const candidates = await this.generateCandidates(userId);
      if (candidates.length > 0) {
        await this.prisma.notification.createMany({
          data: candidates.map((c) => ({ userId, ...c })),
        });
      }
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) return { success: false };
    await this.prisma.notification.update({ where: { id }, data: { isRead: true } });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { success: true };
  }

  private async generateCandidates(userId: string): Promise<Candidate[]> {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const candidates: Candidate[] = [];
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    if (settings.notifyBudgetWarning || settings.notifyBudgetExceeded) {
      const budgets = await this.prisma.budget.findMany({ where: { userId }, include: { category: true } });
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const spend = await this.prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { userId, type: "EXPENSE", date: { gte: monthStart } },
        _sum: { amount: true },
      });
      const spendMap = new Map(spend.map((s) => [s.categoryId as string, new Prisma.Decimal(s._sum.amount ?? 0)]));

      for (const budget of budgets) {
        const spent = spendMap.get(budget.categoryId) ?? new Prisma.Decimal(0);
        const amount = new Prisma.Decimal(budget.amount);
        if (amount.lessThanOrEqualTo(0)) continue;
        const ratio = spent.div(amount).toNumber();

        if (ratio >= 1 && settings.notifyBudgetExceeded) {
          candidates.push({
            type: NotificationType.BUDGET_EXCEEDED,
            title: "Budget exceeded",
            message: `You exceeded your ${budget.category.name} budget by ৳${spent.minus(amount).toFixed(2)}.`,
          });
        } else if (ratio >= 0.8 && settings.notifyBudgetWarning) {
          candidates.push({
            type: NotificationType.BUDGET_WARNING,
            title: "Budget warning",
            message: `You've used ${Math.round(ratio * 100)}% of your ${budget.category.name} budget.`,
          });
        }
      }
    }

    if (settings.notifySubscriptionReminder) {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId, status: "ACTIVE", nextBillingDate: { lte: soon } },
      });
      for (const sub of subscriptions) {
        candidates.push({
          type: NotificationType.SUBSCRIPTION_REMINDER,
          title: "Subscription renewing soon",
          message: `${sub.name} (৳${new Prisma.Decimal(sub.amount).toFixed(2)}) renews on ${sub.nextBillingDate.toDateString()}.`,
        });
      }
    }

    if (settings.notifyUpcomingRecurring) {
      const recurring = await this.prisma.recurringTransaction.findMany({
        where: { userId, status: "ACTIVE", nextRunDate: { lte: soon } },
        include: { category: true },
      });
      for (const r of recurring) {
        candidates.push({
          type: NotificationType.UPCOMING_RECURRING,
          title: "Upcoming recurring transaction",
          message: `${r.category?.name ?? "A recurring transaction"} of ৳${new Prisma.Decimal(r.amount).toFixed(2)} is due ${r.nextRunDate.toDateString()}.`,
        });
      }
    }

    if (settings.notifySavingGoalReminder) {
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const goals = await this.prisma.savingGoal.findMany({
        where: { userId, status: "ACTIVE" },
        include: { contributions: { orderBy: { date: "desc" }, take: 1 } },
      });
      for (const goal of goals) {
        const lastContribution = goal.contributions[0]?.date ?? goal.createdAt;
        if (lastContribution < twoWeeksAgo) {
          candidates.push({
            type: NotificationType.SAVING_GOAL_REMINDER,
            title: "Saving goal reminder",
            message: `You haven't contributed to "${goal.name}" in a while — keep the momentum going!`,
          });
        }
      }
    }

    if (settings.notifyLoanPaymentReminder) {
      const dueSoon = await this.prisma.loanRepaymentSchedule.findMany({
        where: { userId, dueDate: { lte: soon }, loan: { status: "ACTIVE" } },
        include: { loan: true },
      });
      for (const row of dueSoon) {
        const totalDue = new Prisma.Decimal(row.totalDue);
        if (totalDue.lessThanOrEqualTo(row.amountPaid)) continue;
        const overdue = row.dueDate < now;
        candidates.push({
          type: overdue ? NotificationType.LOAN_PAYMENT_OVERDUE : NotificationType.LOAN_PAYMENT_DUE,
          title: overdue ? "Loan payment overdue" : "Loan payment due soon",
          message: `${row.loan.lenderName}: installment #${row.installmentNumber} of ৳${totalDue.toFixed(2)} ${
            overdue ? "was due" : "is due"
          } on ${row.dueDate.toDateString()}.`,
        });
      }
    }

    if (settings.notifyMonthlyReport && now.getDate() <= 3) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      candidates.push({
        type: NotificationType.MONTHLY_REPORT_AVAILABLE,
        title: "Monthly report available",
        message: `Your ${lastMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })} report is ready.`,
      });
    }

    return candidates;
  }
}
