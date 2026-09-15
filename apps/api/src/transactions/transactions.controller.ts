import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { createTransactionSchema } from "@finora/validation";
import { TransactionsService } from "./transactions.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import type { CreateTransactionDto } from "./dto/create-transaction.dto.js";
import { UpdateTransactionDto } from "./dto/update-transaction.dto.js";
import { TransactionQueryDto } from "./dto/transaction-query.dto.js";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createTransactionSchema)) body: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
