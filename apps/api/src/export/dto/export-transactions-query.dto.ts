import { createZodDto } from "nestjs-zod";
import { exportTransactionsQuerySchema } from "@finora/validation";

export class ExportTransactionsQueryDto extends createZodDto(exportTransactionsQuerySchema) {}
