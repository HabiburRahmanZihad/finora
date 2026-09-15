import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CategoryStatus, CategoryType, Prisma } from "@finora/database";
import type { CreateCategoryInput, UpdateCategoryInput } from "@finora/validation";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Global defaults (userId null) + this user's own categories. */
  findAll(userId: string, type?: CategoryType) {
    const where: Prisma.CategoryWhereInput = {
      OR: [{ userId: null }, { userId }],
      ...(type ? { type } : {}),
    };
    return this.prisma.category.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  }

  async create(userId: string, input: CreateCategoryInput) {
    if (input.parentCategoryId) {
      await this.assertOwnedOrGlobal(userId, input.parentCategoryId);
    }
    return this.prisma.category.create({
      data: {
        userId,
        name: input.name,
        icon: input.icon,
        description: input.description,
        type: input.type,
        parentCategoryId: input.parentCategoryId,
      },
    });
  }

  async update(userId: string, id: string, input: UpdateCategoryInput) {
    const category = await this.assertOwned(userId, id);
    if (category.isDefault) {
      throw new ForbiddenException("Default categories can't be edited");
    }
    if (input.parentCategoryId) {
      await this.assertOwnedOrGlobal(userId, input.parentCategoryId);
    }
    return this.prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        icon: input.icon,
        description: input.description,
        status: input.status,
        parentCategoryId: input.parentCategoryId,
      },
    });
  }

  async archive(userId: string, id: string) {
    const category = await this.assertOwned(userId, id);
    if (category.isDefault) {
      throw new ForbiddenException("Default categories can't be archived");
    }
    return this.prisma.category.update({
      where: { id },
      data: { status: CategoryStatus.ARCHIVED },
    });
  }

  private async assertOwned(userId: string, id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || category.userId !== userId) {
      throw new NotFoundException("Category not found");
    }
    return category;
  }

  private async assertOwnedOrGlobal(userId: string, id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || (category.userId !== null && category.userId !== userId)) {
      throw new NotFoundException("Parent category not found");
    }
    return category;
  }
}
