import { createZodDto } from "nestjs-zod";
import { updateTransactionSchema } from "@finora/validation";

export class UpdateTransactionDto extends createZodDto(updateTransactionSchema) {}
