import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { BudgetsService } from "./budgets.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateBudgetDto } from "./dto/create-budget.dto.js";
import { UpdateBudgetDto } from "./dto/update-budget.dto.js";

@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.budgetsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateBudgetDto) {
    return this.budgetsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(user.id, id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.budgetsService.remove(user.id, id);
  }
}
