import { createZodDto } from "nestjs-zod";
import { exportReportQuerySchema } from "@finora/validation";

export class ExportReportQueryDto extends createZodDto(exportReportQuerySchema) {}
