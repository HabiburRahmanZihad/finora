import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { UpdateUserProfileInput } from "@finora/validation";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const settings = user.settings ?? (await this.ensureSettings(userId));
    return { ...user, settings };
  }

  async updateMe(userId: string, input: UpdateUserProfileInput) {
    const { name, ...settingsFields } = input;

    await this.prisma.$transaction([
      ...(name !== undefined
        ? [this.prisma.user.update({ where: { id: userId }, data: { name } })]
        : []),
      this.prisma.userSettings.upsert({
        where: { userId },
        create: { userId, ...settingsFields },
        update: settingsFields,
      }),
    ]);

    return this.getMe(userId);
  }

  private ensureSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }
}
