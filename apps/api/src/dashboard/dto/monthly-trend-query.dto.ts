import { createZodDto } from "nestjs-zod";
import { monthlyTrendQuerySchema } from "@finora/validation";

export class MonthlyTrendQueryDto extends createZodDto(monthlyTrendQuerySchema) {}
