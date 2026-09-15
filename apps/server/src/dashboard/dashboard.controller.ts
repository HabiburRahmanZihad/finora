import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { DashboardQueryDto } from "./dto/dashboard-query.dto.js";
import { MonthlyTrendQueryDto } from "./dto/monthly-trend-query.dto.js";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  async getSummary(@CurrentUser() user: AuthenticatedUser, @Query() query: DashboardQueryDto) {
    const range = this.dashboardService.resolveRange(query);
    return this.dashboardService.getSummary(user.id, range);
  }

  @Get("expense-by-category")
  async getExpenseByCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DashboardQueryDto,
  ) {
    const range = this.dashboardService.resolveRange(query);
    return this.dashboardService.getExpenseByCategory(user.id, range);
  }

  @Get("monthly-trend")
  getMonthlyTrend(@CurrentUser() user: AuthenticatedUser, @Query() query: MonthlyTrendQueryDto) {
    return this.dashboardService.getMonthlyTrend(user.id, query.months);
  }
}
