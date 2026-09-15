import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateTagInput } from "@finora/validation";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } });
  }

  async create(userId: string, input: CreateTagInput) {
    const existing = await this.prisma.tag.findUnique({
      where: { userId_name: { userId, name: input.name } },
    });
    if (existing) throw new ConflictException("A tag with this name already exists");

    return this.prisma.tag.create({ data: { userId, name: input.name, color: input.color } });
  }

  async remove(userId: string, id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag || tag.userId !== userId) throw new NotFoundException("Tag not found");
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }
}
