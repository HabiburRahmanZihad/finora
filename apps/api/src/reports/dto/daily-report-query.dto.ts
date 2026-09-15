import { createZodDto } from "nestjs-zod";
import { dailyReportQuerySchema } from "@finora/validation";

export class DailyReportQueryDto extends createZodDto(dailyReportQuerySchema) {}
