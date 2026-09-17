import { createZodDto } from "nestjs-zod";
import { updateLoanScheduleEntrySchema } from "@finora/validation";

export class UpdateLoanScheduleEntryDto extends createZodDto(updateLoanScheduleEntrySchema) {}
