import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { SavingGoalsService } from "./saving-goals.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateSavingGoalDto } from "./dto/create-saving-goal.dto.js";
import { UpdateSavingGoalDto } from "./dto/update-saving-goal.dto.js";
import { ContributeSavingGoalDto } from "./dto/contribute-saving-goal.dto.js";

@Controller("saving-goals")
export class SavingGoalsController {
  constructor(private readonly savingGoalsService: SavingGoalsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.savingGoalsService.findAll(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.savingGoalsService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateSavingGoalDto) {
    return this.savingGoalsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateSavingGoalDto,
  ) {
    return this.savingGoalsService.update(user.id, id, body);
  }

  @Post(":id/contribute")
  contribute(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: ContributeSavingGoalDto,
  ) {
    return this.savingGoalsService.contribute(user.id, id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.savingGoalsService.remove(user.id, id);
  }
}
