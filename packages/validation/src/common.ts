import { z } from "zod";

/** Positive money amount with at most 2 decimal places, as a string (Decimal-safe). */
export const moneyAmountSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val))
  .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
    message: "Amount must be a positive number with at most 2 decimal places",
  })
  .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const cuidSchema = z.string().min(1, "Required");
