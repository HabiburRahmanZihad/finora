import { Controller, Get } from "@nestjs/common";
import { GamificationService } from "./gamification.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";

@Controller("gamification")
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get()
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.gamificationService.getSummary(user.id);
  }
}
