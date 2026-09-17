import { createZodDto } from "nestjs-zod";
import { recordLoanPaymentSchema } from "@finora/validation";

export class RecordLoanPaymentDto extends createZodDto(recordLoanPaymentSchema) {}
