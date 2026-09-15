import { Controller, Get } from "@nestjs/common";
import { HealthScoreService } from "./health-score.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";

@Controller("health-score")
export class HealthScoreController {
  constructor(private readonly healthScoreService: HealthScoreService) {}

  @Get()
  getScore(@CurrentUser() user: AuthenticatedUser) {
    return this.healthScoreService.getScore(user.id);
  }
}
