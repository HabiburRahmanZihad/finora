import { createZodDto } from "nestjs-zod";
import { whatIfSchema } from "@finora/validation";

export class WhatIfDto extends createZodDto(whatIfSchema) {}
