import { createZodDto } from "nestjs-zod";
import { createBudgetSchema } from "@finora/validation";

export class CreateBudgetDto extends createZodDto(createBudgetSchema) {}
