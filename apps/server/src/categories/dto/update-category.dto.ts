import { createZodDto } from "nestjs-zod";
import { updateCategorySchema } from "@finora/validation";

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
