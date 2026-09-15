import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { DailyReportQueryDto } from "./dto/daily-report-query.dto.js";
import { MonthlyReportQueryDto } from "./dto/monthly-report-query.dto.js";
import { YearlyReportQueryDto } from "./dto/yearly-report-query.dto.js";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("daily")
  getDaily(@CurrentUser() user: AuthenticatedUser, @Query() query: DailyReportQueryDto) {
    return this.reportsService.getDailyReport(user.id, query.date ?? new Date());
  }

  @Get("monthly")
  getMonthly(@CurrentUser() user: AuthenticatedUser, @Query() query: MonthlyReportQueryDto) {
    const now = new Date();
    return this.reportsService.getMonthlyReport(
      user.id,
      query.year ?? now.getFullYear(),
      query.month ?? now.getMonth() + 1,
    );
  }

  @Get("yearly")
  getYearly(@CurrentUser() user: AuthenticatedUser, @Query() query: YearlyReportQueryDto) {
    return this.reportsService.getYearlyReport(user.id, query.year ?? new Date().getFullYear());
  }
}
