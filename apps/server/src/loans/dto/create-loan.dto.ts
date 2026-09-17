import { createZodDto } from "nestjs-zod";
import { createLoanSchema } from "@finora/validation";

export class CreateLoanDto extends createZodDto(createLoanSchema) {}
