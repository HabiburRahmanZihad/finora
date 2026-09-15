import { createZodDto } from "nestjs-zod";
import { createCategorySchema } from "@finora/validation";

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}
