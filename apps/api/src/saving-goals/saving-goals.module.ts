import { Module } from "@nestjs/common";
import { SavingGoalsController } from "./saving-goals.controller.js";
import { SavingGoalsService } from "./saving-goals.service.js";

@Module({
  controllers: [SavingGoalsController],
  providers: [SavingGoalsService],
})
export class SavingGoalsModule {}
