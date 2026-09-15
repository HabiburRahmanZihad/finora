import { createZodDto } from "nestjs-zod";
import { updateRecurringTransactionSchema } from "@finora/validation";

export class UpdateRecurringTransactionDto extends createZodDto(updateRecurringTransactionSchema) {}
