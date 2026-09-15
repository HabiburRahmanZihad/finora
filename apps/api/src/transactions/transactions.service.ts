import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CategoryType, Prisma, TransactionType } from "@finora/database";
import type {
  CreateTransactionInput,
  TransactionQueryInput,
  UpdateTransactionInput,
} from "@finora/validation";
import type { PaginatedResult } from "@finora/types";

const transactionInclude = {
  category: true,
  account: true,
  fromAccount: true,
  toAccount: true,
  tags: { include: { tag: true } },
} satisfies Prisma.TransactionInclude;

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: TransactionQueryInput): Promise<PaginatedResult<unknown>> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.accountId
        ? {
            OR: [
              { accountId: query.accountId },
              { fromAccountId: query.accountId },
              { toAccountId: query.accountId },
            ],
          }
        : {}),
      ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
      ...(query.tagId ? { tags: { some: { tagId: query.tagId } } } : {}),
      ...(query.from || query.to
        ? { date: { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: query.to } : {}) } }
        : {}),
      ...(query.search ? { note: { contains: query.search, mode: "insensitive" } } : {}),
    };

    const orderBy: Prisma.TransactionOrderByWithRelationInput =
      query.sort === "oldest"
        ? { date: "asc" }
        : query.sort === "highest"
          ? { amount: "desc" }
          : query.sort === "lowest"
            ? { amount: "asc" }
            : { date: "desc" };

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: transactionInclude,
    });
    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException("Transaction not found");
    }
    return transaction;
  }

  async create(userId: string, input: CreateTransactionInput) {
    if (input.tagIds?.length) await this.assertTagsOwned(userId, input.tagIds);

    if (input.type === TransactionType.TRANSFER) {
      await this.assertAccountOwned(userId, input.fromAccountId);
      await this.assertAccountOwned(userId, input.toAccountId);

      return this.prisma.transaction.create({
        data: {
          userId,
          type: TransactionType.TRANSFER,
          amount: input.amount,
          date: input.date,
          note: input.note,
          location: input.location,
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          tags: input.tagIds?.length
            ? { create: input.tagIds.map((tagId) => ({ tagId })) }
            : undefined,
        },
        include: transactionInclude,
      });
    }

    await this.assertAccountOwned(userId, input.accountId);
    await this.assertCategoryUsable(userId, input.categoryId, input.type);

    return this.prisma.transaction.create({
      data: {
        userId,
        type: input.type,
        amount: input.amount,
        date: input.date,
        note: input.note,
        location: input.location,
        accountId: input.accountId,
        categoryId: input.categoryId,
        paymentMethod: input.type === TransactionType.EXPENSE ? input.paymentMethod : undefined,
        source: input.type === TransactionType.INCOME ? input.source : undefined,
        tags: input.tagIds?.length
          ? { create: input.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: transactionInclude,
    });
  }

  async update(userId: string, id: string, input: UpdateTransactionInput) {
    const existing = await this.findOne(userId, id);

    if (input.accountId) await this.assertAccountOwned(userId, input.accountId);
    if (input.categoryId) await this.assertCategoryUsable(userId, input.categoryId, existing.type);
    if (input.tagIds) await this.assertTagsOwned(userId, input.tagIds);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        amount: input.amount,
        date: input.date,
        note: input.note,
        location: input.location,
        accountId: input.accountId,
        categoryId: input.categoryId,
        paymentMethod: input.paymentMethod,
        source: input.source,
        ...(input.tagIds
          ? { tags: { deleteMany: {}, create: input.tagIds.map((tagId) => ({ tagId })) } }
          : {}),
      },
      include: transactionInclude,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
    return { success: true };
  }

  private async assertAccountOwned(userId: string, accountId: string) {
    const account = await this.prisma.financialAccount.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== userId) {
      throw new BadRequestException("Account not found");
    }
  }

  private async assertCategoryUsable(userId: string, categoryId: string, type: TransactionType) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || (category.userId !== null && category.userId !== userId)) {
      throw new BadRequestException("Category not found");
    }
    const expectedType = type === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
    if (category.type !== expectedType) {
      throw new BadRequestException(`Category is not an ${expectedType.toLowerCase()} category`);
    }
  }

  private async assertTagsOwned(userId: string, tagIds: string[]) {
    const count = await this.prisma.tag.count({ where: { id: { in: tagIds }, userId } });
    if (count !== tagIds.length) {
      throw new BadRequestException("One or more tags not found");
    }
  }
}
