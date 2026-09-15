import { createZodDto } from "nestjs-zod";
import { updateSavingGoalSchema } from "@finora/validation";

export class UpdateSavingGoalDto extends createZodDto(updateSavingGoalSchema) {}
