import { Module } from "@nestjs/common";
import { RecurringTransactionsController } from "./recurring-transactions.controller.js";
import { RecurringTransactionsService } from "./recurring-transactions.service.js";

@Module({
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
