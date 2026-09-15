import { z } from "zod";
import { PaymentMethod, TransactionType } from "@finora/types";
import { moneyAmountSchema } from "./common.js";

const baseFields = {
  amount: moneyAmountSchema,
  date: z.coerce.date(),
  note: z.string().trim().max(500).optional(),
  location: z.string().trim().max(120).optional(),
  tagIds: z.array(z.string()).max(20).optional().default([]),
};

const expenseSchema = z.object({
  type: z.literal(TransactionType.EXPENSE),
  ...baseFields,
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

const incomeSchema = z.object({
  type: z.literal(TransactionType.INCOME),
  ...baseFields,
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  source: z.string().trim().max(120).optional(),
});

const transferSchema = z.object({
  type: z.literal(TransactionType.TRANSFER),
  ...baseFields,
  fromAccountId: z.string().min(1, "From account is required"),
  toAccountId: z.string().min(1, "To account is required"),
});

export const createTransactionSchema = z
  .discriminatedUnion("type", [expenseSchema, incomeSchema, transferSchema])
  .superRefine((data, ctx) => {
    if (data.type === TransactionType.TRANSFER && data.fromAccountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "From and To accounts must be different",
        path: ["toAccountId"],
      });
    }
  });
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z.object({
  amount: moneyAmountSchema.optional(),
  date: z.coerce.date().optional(),
  note: z.string().trim().max(500).optional(),
  location: z.string().trim().max(120).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  source: z.string().trim().max(120).optional(),
  tagIds: z.array(z.string()).max(20).optional(),
});
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  tagId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "oldest", "highest", "lowest"]).default("newest"),
});
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
