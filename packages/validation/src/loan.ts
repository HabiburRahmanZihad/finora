import { z } from "zod";
import {
  LoanType,
  LoanInterestType,
  LoanInterestFrequency,
  LoanRepaymentFrequency,
  LoanInstallmentType,
} from "@finora/types";
import { moneyAmountSchema, cuidSchema } from "./common.js";

export const createLoanSchema = z
  .object({
    lenderName: z.string().trim().min(1, "Lender is required").max(120),
    loanType: z.nativeEnum(LoanType),
    principalAmount: moneyAmountSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    hasInterest: z.boolean(),
    interestType: z.nativeEnum(LoanInterestType).optional(),
    interestValue: moneyAmountSchema.optional(),
    interestFrequency: z.nativeEnum(LoanInterestFrequency).optional(),
    repaymentFrequency: z.nativeEnum(LoanRepaymentFrequency),
    customRepaymentDays: z.coerce.number().int().min(1).max(365).optional(),
    installmentType: z.nativeEnum(LoanInstallmentType),
    note: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      !data.hasInterest ||
      (data.interestType !== undefined &&
        data.interestValue !== undefined &&
        data.interestFrequency !== undefined),
    {
      message: "Interest type, value and frequency are required when the loan has interest",
      path: ["interestType"],
    },
  )
  .refine((data) => data.repaymentFrequency !== LoanRepaymentFrequency.CUSTOM || data.customRepaymentDays !== undefined, {
    message: "Custom interval (in days) is required for a custom repayment frequency",
    path: ["customRepaymentDays"],
  });
export type CreateLoanInput = z.infer<typeof createLoanSchema>;

export const updateLoanSchema = z.object({
  lenderName: z.string().trim().min(1).max(120).optional(),
  loanType: z.nativeEnum(LoanType).optional(),
  principalAmount: moneyAmountSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  hasInterest: z.boolean().optional(),
  interestType: z.nativeEnum(LoanInterestType).nullable().optional(),
  interestValue: moneyAmountSchema.nullable().optional(),
  interestFrequency: z.nativeEnum(LoanInterestFrequency).nullable().optional(),
  repaymentFrequency: z.nativeEnum(LoanRepaymentFrequency).optional(),
  customRepaymentDays: z.coerce.number().int().min(1).max(365).nullable().optional(),
  installmentType: z.nativeEnum(LoanInstallmentType).optional(),
  note: z.string().trim().max(300).nullable().optional(),
});
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

export const recordLoanPaymentSchema = z.object({
  scheduleId: cuidSchema,
  amount: moneyAmountSchema,
  paidDate: z.coerce.date().optional(),
  note: z.string().trim().max(200).optional(),
  accountId: z.string().optional(),
});
export type RecordLoanPaymentInput = z.infer<typeof recordLoanPaymentSchema>;

export const updateLoanScheduleEntrySchema = z
  .object({
    dueDate: z.coerce.date().optional(),
    totalDue: moneyAmountSchema.optional(),
  })
  .refine((data) => data.dueDate !== undefined || data.totalDue !== undefined, {
    message: "Provide a new due date or amount",
  });
export type UpdateLoanScheduleEntryInput = z.infer<typeof updateLoanScheduleEntrySchema>;
