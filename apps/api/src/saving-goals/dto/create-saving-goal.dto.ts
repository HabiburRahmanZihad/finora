import { createZodDto } from "nestjs-zod";
import { createSavingGoalSchema } from "@finora/validation";

export class CreateSavingGoalDto extends createZodDto(createSavingGoalSchema) {}
