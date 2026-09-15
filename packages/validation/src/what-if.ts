import { z } from "zod";

export const whatIfSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  percentChange: z.coerce.number().min(-100).max(500),
});
export type WhatIfInput = z.infer<typeof whatIfSchema>;
