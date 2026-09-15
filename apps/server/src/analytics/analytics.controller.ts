import { Controller, Get } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("spending")
  getSpending(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getSpendingAnalytics(user.id);
  }

  @Get("savings")
  getSavings(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getSavingsAnalytics(user.id);
  }

  @Get("categories")
  getCategories(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getCategoryAnalytics(user.id);
  }
}
