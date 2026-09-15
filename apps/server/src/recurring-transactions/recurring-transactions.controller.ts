import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { RecurringTransactionsService } from "./recurring-transactions.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateRecurringTransactionDto } from "./dto/create-recurring-transaction.dto.js";
import { UpdateRecurringTransactionDto } from "./dto/update-recurring-transaction.dto.js";

@Controller("recurring-transactions")
export class RecurringTransactionsController {
  constructor(private readonly recurringTransactionsService: RecurringTransactionsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.recurringTransactionsService.findAll(user.id);
  }

  @Get("upcoming")
  getUpcoming(@CurrentUser() user: AuthenticatedUser, @Query("days") days?: string) {
    return this.recurringTransactionsService.getUpcoming(user.id, days ? Number(days) : 14);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateRecurringTransactionDto) {
    return this.recurringTransactionsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.update(user.id, id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.recurringTransactionsService.remove(user.id, id);
  }
}
