import { Module } from "@nestjs/common";
import { ExportController } from "./export.controller.js";
import { ExportService } from "./export.service.js";
import { ReportsModule } from "../reports/reports.module.js";

@Module({
  imports: [ReportsModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
