import { createZodDto } from "nestjs-zod";
import { updateBudgetSchema } from "@finora/validation";

export class UpdateBudgetDto extends createZodDto(updateBudgetSchema) {}
