import { createZodDto } from "nestjs-zod";
import { createFinancialAccountSchema } from "@finora/validation";

export class CreateFinancialAccountDto extends createZodDto(createFinancialAccountSchema) {}
