import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const startedAt = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startedAt;

    const memory = process.memoryUsage();

    return {
      status: "ok",
      dbLatencyMs,
      uptimeSeconds: Math.round(process.uptime()),
      memory: {
        rssBytes: memory.rss,
        heapUsedBytes: memory.heapUsed,
        heapTotalBytes: memory.heapTotal,
      },
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }

  async getStats() {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * DAY_MS);
    const thirtyDaysAgo = new Date(now - 30 * DAY_MS);

    const [
      totalUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      totalTransactions,
      totalBudgets,
      totalSavingGoals,
      totalSubscriptions,
      activeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.transaction.count(),
      this.prisma.budget.count(),
      this.prisma.savingGoal.count(),
      this.prisma.subscription.count(),
      this.prisma.transaction.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        distinct: ["userId"],
        select: { userId: true },
      }),
    ]);

    return {
      totalUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      activeUsersLast30Days: activeUsers.length,
      totalTransactions,
      totalBudgets,
      totalSavingGoals,
      totalSubscriptions,
    };
  }

  async getTraffic() {
    const since = new Date(Date.now() - 14 * DAY_MS);

    const [requestsPerDay, topRoutes, statusBreakdown, avgDuration] = await Promise.all([
      this.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
        FROM "request_logs"
        WHERE "createdAt" >= ${since}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.requestLog.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      this.prisma.$queryRaw<Array<{ statusclass: string; count: bigint }>>`
        SELECT (FLOOR("statusCode" / 100) || 'xx') AS statusclass, COUNT(*)::bigint AS count
        FROM "request_logs"
        WHERE "createdAt" >= ${since}
        GROUP BY statusclass
        ORDER BY statusclass ASC
      `,
      this.prisma.requestLog.aggregate({
        where: { createdAt: { gte: since } },
        _avg: { durationMs: true },
      }),
    ]);

    return {
      requestsPerDay: requestsPerDay.map((row) => ({
        date: row.day.toISOString().slice(0, 10),
        count: Number(row.count),
      })),
      topRoutes: topRoutes.map((row) => ({ path: row.path, count: row._count.path })),
      statusBreakdown: statusBreakdown.map((row) => ({
        statusClass: row.statusclass,
        count: Number(row.count),
      })),
      averageDurationMs: Math.round(avgDuration._avg.durationMs ?? 0),
    };
  }
}
