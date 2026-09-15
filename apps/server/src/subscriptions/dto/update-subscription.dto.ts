import { createZodDto } from "nestjs-zod";
import { updateSubscriptionSchema } from "@finora/validation";

export class UpdateSubscriptionDto extends createZodDto(updateSubscriptionSchema) {}
