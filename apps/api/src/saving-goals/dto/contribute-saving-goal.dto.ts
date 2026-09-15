import { createZodDto } from "nestjs-zod";
import { contributeSavingGoalSchema } from "@finora/validation";

export class ContributeSavingGoalDto extends createZodDto(contributeSavingGoalSchema) {}
