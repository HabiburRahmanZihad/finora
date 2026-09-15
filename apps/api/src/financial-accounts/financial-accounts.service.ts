import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AccountStatus, Prisma, TransactionType } from "@finora/database";
import type {
  CreateFinancialAccountInput,
  UpdateFinancialAccountInput,
} from "@finora/validation";

@Injectable()
export class FinancialAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const accounts = await this.prisma.financialAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const balances = await this.computeCurrentBalances(
      userId,
      accounts.map((a) => a.id),
    );
    return accounts.map((account) => ({
      ...account,
      currentBalance: (balances.get(account.id) ?? new Prisma.Decimal(account.balance)).toFixed(2),
    }));
  }

  async findOne(userId: string, id: string) {
    const account = await this.assertOwned(userId, id);
    const balances = await this.computeCurrentBalances(userId, [id]);
    return {
      ...account,
      currentBalance: (balances.get(id) ?? new Prisma.Decimal(account.balance)).toFixed(2),
    };
  }

  create(userId: string, input: CreateFinancialAccountInput) {
    return this.prisma.financialAccount.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        balance: input.balance,
        currency: input.currency,
      },
    });
  }

  async update(userId: string, id: string, input: UpdateFinancialAccountInput) {
    await this.assertOwned(userId, id);
    return this.prisma.financialAccount.update({
      where: { id },
      data: { name: input.name, type: input.type, status: input.status },
    });
  }

  async archive(userId: string, id: string) {
    await this.assertOwned(userId, id);
    return this.prisma.financialAccount.update({
      where: { id },
      data: { status: AccountStatus.ARCHIVED },
    });
  }

  private async assertOwned(userId: string, id: string) {
    const account = await this.prisma.financialAccount.findUnique({ where: { id } });
    if (!account || account.userId !== userId) {
      throw new NotFoundException("Account not found");
    }
    return account;
  }

  /** Opening balance + net effect of income/expense/transfer transactions, per account. */
  private async computeCurrentBalances(userId: string, accountIds: string[]) {
    if (accountIds.length === 0) return new Map<string, Prisma.Decimal>();

    const accounts = await this.prisma.financialAccount.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, balance: true },
    });
    const result = new Map<string, Prisma.Decimal>(
      accounts.map((a) => [a.id, new Prisma.Decimal(a.balance)]),
    );

    const [income, expense, transferOut, transferIn] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ["accountId"],
        where: { userId, type: TransactionType.INCOME, accountId: { in: accountIds } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ["accountId"],
        where: { userId, type: TransactionType.EXPENSE, accountId: { in: accountIds } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ["fromAccountId"],
        where: { userId, type: TransactionType.TRANSFER, fromAccountId: { in: accountIds } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ["toAccountId"],
        where: { userId, type: TransactionType.TRANSFER, toAccountId: { in: accountIds } },
        _sum: { amount: true },
      }),
    ]);

    for (const row of income) {
      if (!row.accountId || !row._sum.amount) continue;
      result.set(row.accountId, (result.get(row.accountId) ?? new Prisma.Decimal(0)).plus(row._sum.amount));
    }
    for (const row of expense) {
      if (!row.accountId || !row._sum.amount) continue;
      result.set(row.accountId, (result.get(row.accountId) ?? new Prisma.Decimal(0)).minus(row._sum.amount));
    }
    for (const row of transferOut) {
      if (!row.fromAccountId || !row._sum.amount) continue;
      result.set(
        row.fromAccountId,
        (result.get(row.fromAccountId) ?? new Prisma.Decimal(0)).minus(row._sum.amount),
      );
    }
    for (const row of transferIn) {
      if (!row.toAccountId || !row._sum.amount) continue;
      result.set(
        row.toAccountId,
        (result.get(row.toAccountId) ?? new Prisma.Decimal(0)).plus(row._sum.amount),
      );
    }

    return result;
  }
}
