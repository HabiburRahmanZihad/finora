"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { recordLoanPaymentSchema, type RecordLoanPaymentInput } from "@finora/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/features/accounts/use-accounts";
import { useRecordLoanPayment } from "./use-loans";

export function RecordPaymentDialog({
  loanId,
  scheduleId,
  installmentNumber,
  remainingAmount,
  lenderName,
}: {
  loanId: string;
  scheduleId: string;
  installmentNumber: number;
  remainingAmount: string;
  lenderName: string;
}) {
  const [open, setOpen] = useState(false);
  const recordPayment = useRecordLoanPayment();
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof recordLoanPaymentSchema>,
    unknown,
    z.output<typeof recordLoanPaymentSchema>
  >({
    resolver: zodResolver(recordLoanPaymentSchema),
    defaultValues: {
      scheduleId,
      amount: remainingAmount,
      paidDate: new Date().toISOString().slice(0, 10) as unknown as Date,
    },
  });

  const onSubmit = async (values: RecordLoanPaymentInput) => {
    try {
      await recordPayment.mutateAsync({ loanId, ...values });
      toast.success("Payment recorded");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Record payment — {lenderName} #{installmentNumber}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" inputMode="decimal" placeholder="0.00" {...register("amount")} />
            <p className="text-xs text-muted-foreground">Remaining due: {remainingAmount}</p>
            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paidDate">Payment date</Label>
            <Input id="paidDate" type="date" {...register("paidDate")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Pay from account (optional)</Label>
            <Controller
              control={control}
              name="accountId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Untracked (cash / not linked)" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      ?.filter((a) => a.status === "ACTIVE")
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Linking an account posts this as an expense so your balance and dashboard stay accurate.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="e.g. Paid via bKash" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={recordPayment.isPending}>
              {recordPayment.isPending ? "Saving…" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
