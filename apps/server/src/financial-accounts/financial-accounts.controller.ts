import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { FinancialAccountsService } from "./financial-accounts.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateFinancialAccountDto } from "./dto/create-financial-account.dto.js";
import { UpdateFinancialAccountDto } from "./dto/update-financial-account.dto.js";

@Controller("accounts")
export class FinancialAccountsController {
  constructor(private readonly accountsService: FinancialAccountsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.accountsService.findAll(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.accountsService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateFinancialAccountDto) {
    return this.accountsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateFinancialAccountDto,
  ) {
    return this.accountsService.update(user.id, id, body);
  }

  @Delete(":id")
  archive(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.accountsService.archive(user.id, id);
  }
}
