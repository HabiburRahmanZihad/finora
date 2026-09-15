import { createZodDto } from "nestjs-zod";
import { createSubscriptionSchema } from "@finora/validation";

export class CreateSubscriptionDto extends createZodDto(createSubscriptionSchema) {}
