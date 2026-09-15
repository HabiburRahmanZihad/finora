import { createZodDto } from "nestjs-zod";
import { monthlyReportQuerySchema } from "@finora/validation";

export class MonthlyReportQueryDto extends createZodDto(monthlyReportQuerySchema) {}
