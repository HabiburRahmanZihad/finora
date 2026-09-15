import { createZodDto } from "nestjs-zod";
import { updateFinancialAccountSchema } from "@finora/validation";

export class UpdateFinancialAccountDto extends createZodDto(updateFinancialAccountSchema) {}
