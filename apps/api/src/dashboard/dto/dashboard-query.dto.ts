import { createZodDto } from "nestjs-zod";
import { dashboardQuerySchema } from "@finora/validation";

export class DashboardQueryDto extends createZodDto(dashboardQuerySchema) {}
