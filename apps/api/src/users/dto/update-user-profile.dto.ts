import { createZodDto } from "nestjs-zod";
import { updateUserProfileSchema } from "@finora/validation";

export class UpdateUserProfileDto extends createZodDto(updateUserProfileSchema) {}
