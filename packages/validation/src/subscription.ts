import { z } from "zod";
import { BillingCycle, SubscriptionStatus } from "@finora/types";
import { moneyAmountSchema } from "./common.js";

export const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  amount: moneyAmountSchema,
  billingCycle: z.nativeEnum(BillingCycle),
  nextBillingDate: z.coerce.date(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  note: z.string().trim().max(200).optional(),
});
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const updateSubscriptionSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  amount: moneyAmountSchema.optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  nextBillingDate: z.coerce.date().optional(),
  categoryId: z.string().nullable().optional(),
  accountId: z.string().nullable().optional(),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  note: z.string().trim().max(200).optional(),
});
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
