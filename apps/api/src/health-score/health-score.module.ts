import { Module } from "@nestjs/common";
import { HealthScoreController } from "./health-score.controller.js";
import { HealthScoreService } from "./health-score.service.js";

@Module({
  controllers: [HealthScoreController],
  providers: [HealthScoreService],
})
export class HealthScoreModule {}
