import { z } from "zod";
import { CategoryStatus, CategoryType } from "@finora/types";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  icon: z.string().trim().max(60).optional(),
  description: z.string().trim().max(200).optional(),
  type: z.nativeEnum(CategoryType),
  parentCategoryId: z.string().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  icon: z.string().trim().max(60).optional(),
  description: z.string().trim().max(200).optional(),
  status: z.nativeEnum(CategoryStatus).optional(),
  parentCategoryId: z.string().nullable().optional(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
