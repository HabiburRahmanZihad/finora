import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { LoansService } from "./loans.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { CreateLoanDto } from "./dto/create-loan.dto.js";
import { UpdateLoanDto } from "./dto/update-loan.dto.js";
import { RecordLoanPaymentDto } from "./dto/record-loan-payment.dto.js";
import { UpdateLoanScheduleEntryDto } from "./dto/update-loan-schedule-entry.dto.js";

@Controller("loans")
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.loansService.findAll(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.loansService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateLoanDto) {
    return this.loansService.create(user.id, body);
  }

  @Patch(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() body: UpdateLoanDto) {
    return this.loansService.update(user.id, id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.loansService.remove(user.id, id);
  }

  @Patch(":id/schedule/:scheduleId")
  updateScheduleEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("scheduleId") scheduleId: string,
    @Body() body: UpdateLoanScheduleEntryDto,
  ) {
    return this.loansService.updateScheduleEntry(user.id, id, scheduleId, body);
  }

  @Post(":id/payments")
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: RecordLoanPaymentDto,
  ) {
    return this.loansService.recordPayment(user.id, id, body);
  }
}
