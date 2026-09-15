import { createZodDto } from "nestjs-zod";
import { createTagSchema } from "@finora/validation";

export class CreateTagDto extends createZodDto(createTagSchema) {}
