import { Body, Controller, Get, Post } from "@nestjs/common";
import { ForecastService } from "./forecast.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { WhatIfDto } from "./dto/what-if.dto.js";

@Controller()
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get("forecast")
  getForecast(@CurrentUser() user: AuthenticatedUser) {
    return this.forecastService.getExpenseForecast(user.id);
  }

  @Post("what-if")
  runWhatIf(@CurrentUser() user: AuthenticatedUser, @Body() body: WhatIfDto) {
    return this.forecastService.runWhatIf(user.id, body);
  }
}
