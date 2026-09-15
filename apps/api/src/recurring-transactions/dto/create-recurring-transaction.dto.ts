import { createZodDto } from "nestjs-zod";
import { createRecurringTransactionSchema } from "@finora/validation";

export class CreateRecurringTransactionDto extends createZodDto(createRecurringTransactionSchema) {}
