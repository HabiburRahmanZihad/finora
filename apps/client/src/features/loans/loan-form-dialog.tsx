"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import type { z } from "zod";
import {
  createLoanSchema,
  updateLoanSchema,
  type CreateLoanInput,
  type UpdateLoanInput,
} from "@finora/validation";
import {
  LoanType,
  LoanInterestType,
  LoanInterestFrequency,
  LoanRepaymentFrequency,
  LoanInstallmentType,
} from "@finora/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLoan, useUpdateLoan, type LoanDetail } from "./use-loans";

export const loanTypeLabels: Record<LoanType, string> = {
  PERSONAL: "Personal",
  BANK: "Bank",
  CREDIT_CARD: "Credit Card",
  FRIEND_FAMILY: "Friend / Family",
  MORTGAGE: "Mortgage",
  VEHICLE: "Vehicle",
  STUDENT: "Student",
  BUSINESS: "Business",
  OTHER: "Other",
};

export const repaymentFrequencyLabels: Record<LoanRepaymentFrequency, string> = {
  ONE_TIME: "One-time",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BI_WEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
  CUSTOM: "Custom (days)",
};

export const interestFrequencyLabels: Record<LoanInterestFrequency, string> = {
  ONE_TIME: "One-time",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

export function LoanFormDialog({ loan }: { loan?: LoanDetail }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(loan);
  const termsLocked = Boolean(loan && loan.payments.length > 0);
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();
  const schema = isEdit ? updateLoanSchema : createLoanSchema;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: loan
      ? {
          lenderName: loan.lenderName,
          loanType: loan.loanType,
          principalAmount: loan.principalAmount,
          startDate: toDateInputValue(loan.startDate) as unknown as Date,
          endDate: toDateInputValue(loan.endDate) as unknown as Date,
          hasInterest: loan.hasInterest,
          interestType: loan.interestType ?? undefined,
          interestValue: loan.interestValue ?? undefined,
          interestFrequency: loan.interestFrequency ?? undefined,
          repaymentFrequency: loan.repaymentFrequency,
          customRepaymentDays: loan.customRepaymentDays ?? undefined,
          installmentType: loan.installmentType,
          note: loan.note ?? undefined,
        }
      : {
          loanType: LoanType.PERSONAL,
          hasInterest: false,
          repaymentFrequency: LoanRepaymentFrequency.MONTHLY,
          installmentType: LoanInstallmentType.FIXED,
        },
  });

  const hasInterest = watch("hasInterest");
  const interestType = watch("interestType");
  const repaymentFrequency = watch("repaymentFrequency");

  const onSubmit = async (values: CreateLoanInput | UpdateLoanInput) => {
    try {
      if (isEdit && loan) {
        await updateLoan.mutateAsync({ id: loan.id, ...(values as UpdateLoanInput) });
        toast.success("Loan updated");
      } else {
        await createLoan.mutateAsync(values as CreateLoanInput);
        toast.success("Loan added");
        reset();
      }
      setOpen(false);
    } catch {
      toast.error(isEdit ? "Could not update loan" : "Could not add loan");
    }
  };

  const isPending = createLoan.isPending || updateLoan.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" /> Edit
          </Button>
        ) : (
          <Button>
            <Plus /> Add Loan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit loan" : "Add a loan"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {termsLocked && (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Loan terms are locked once payments exist — edit individual installments from the schedule
              instead, or delete and recreate the loan.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lenderName">Lender</Label>
              <Input id="lenderName" placeholder="e.g. City Bank" {...register("lenderName")} />
              {errors.lenderName && <p className="text-xs text-danger">{errors.lenderName.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Loan type</Label>
              <Controller
                control={control}
                name="loanType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LoanType).map((t) => (
                        <SelectItem key={t} value={t}>
                          {loanTypeLabels[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="principalAmount">Principal amount</Label>
            <Input
              id="principalAmount"
              inputMode="decimal"
              placeholder="0.00"
              disabled={termsLocked}
              {...register("principalAmount")}
            />
            {errors.principalAmount && (
              <p className="text-xs text-danger">{errors.principalAmount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" disabled={termsLocked} {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-danger">{errors.startDate.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" disabled={termsLocked} {...register("endDate")} />
              {errors.endDate && <p className="text-xs text-danger">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Installment type</Label>
              <Controller
                control={control}
                name="installmentType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={termsLocked}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LoanInstallmentType.FIXED}>Fixed</SelectItem>
                      <SelectItem value={LoanInstallmentType.VARIABLE}>Variable</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Repayment frequency</Label>
              <Controller
                control={control}
                name="repaymentFrequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={termsLocked}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LoanRepaymentFrequency).map((f) => (
                        <SelectItem key={f} value={f}>
                          {repaymentFrequencyLabels[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {repaymentFrequency === LoanRepaymentFrequency.CUSTOM && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customRepaymentDays">Repeat every N days</Label>
              <Input
                id="customRepaymentDays"
                type="number"
                placeholder="30"
                disabled={termsLocked}
                {...register("customRepaymentDays", { valueAsNumber: true })}
              />
              {errors.customRepaymentDays && (
                <p className="text-xs text-danger">{errors.customRepaymentDays.message}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label htmlFor="hasInterest" className="cursor-pointer">
              This loan has interest
            </Label>
            <Controller
              control={control}
              name="hasInterest"
              render={({ field }) => (
                <Switch
                  id="hasInterest"
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                  disabled={termsLocked}
                />
              )}
            />
          </div>

          {hasInterest && (
            <div className="flex flex-col gap-4 rounded-lg border border-border p-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Interest type</Label>
                  <Controller
                    control={control}
                    name="interestType"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        disabled={termsLocked}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={LoanInterestType.PERCENTAGE}>Percentage</SelectItem>
                          <SelectItem value={LoanInterestType.FIXED}>Fixed amount</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="interestValue">
                    {interestType === LoanInterestType.FIXED ? "Fixed amount per period" : "Rate (%)"}
                  </Label>
                  <Input
                    id="interestValue"
                    inputMode="decimal"
                    placeholder={interestType === LoanInterestType.FIXED ? "0.00" : "e.g. 12"}
                    disabled={termsLocked}
                    {...register("interestValue")}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Interest calculation frequency</Label>
                <Controller
                  control={control}
                  name="interestFrequency"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                      disabled={termsLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(LoanInterestFrequency).map((f) => (
                          <SelectItem key={f} value={f}>
                            {interestFrequencyLabels[f]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.interestType && <p className="text-xs text-danger">{errors.interestType.message}</p>}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="e.g. Emergency loan from brother" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Add loan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
