import { createZodDto } from "nestjs-zod";
import { updateLoanSchema } from "@finora/validation";

export class UpdateLoanDto extends createZodDto(updateLoanSchema) {}
