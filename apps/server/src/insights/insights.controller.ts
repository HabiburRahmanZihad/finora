import { Controller, Get, Param, Patch } from "@nestjs/common";
import { InsightsService } from "./insights.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";

@Controller("insights")
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.insightsService.findAll(user.id);
  }

  @Patch(":id/dismiss")
  dismiss(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.insightsService.dismiss(user.id, id);
  }
}
