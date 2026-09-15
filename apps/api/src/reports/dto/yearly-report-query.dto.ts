import { createZodDto } from "nestjs-zod";
import { yearlyReportQuerySchema } from "@finora/validation";

export class YearlyReportQueryDto extends createZodDto(yearlyReportQuerySchema) {}
