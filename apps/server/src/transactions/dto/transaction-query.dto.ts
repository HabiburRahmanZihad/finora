import { createZodDto } from "nestjs-zod";
import { transactionQuerySchema } from "@finora/validation";

export class TransactionQueryDto extends createZodDto(transactionQuerySchema) {}
