"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createTransactionSchema, type CreateTransactionInput } from "@finora/validation";
import { TransactionType, PaymentMethod, CategoryType } from "@finora/types";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTransaction } from "./use-transactions";
import { useAccounts } from "@/features/accounts/use-accounts";
import { useCategories } from "@/features/categories/use-categories";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Cash",
  BANK: "Bank",
  CARD: "Card",
  MOBILE_WALLET: "Mobile Wallet",
  OTHER: "Other",
};

function toDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TransactionFormDialog() {
  const [open, setOpen] = useState(false);
  const createTransaction = useCreateTransaction();
  const { data: accounts } = useAccounts();
  const { data: expenseCategories } = useCategories(CategoryType.EXPENSE);
  const { data: incomeCategories } = useCategories(CategoryType.INCOME);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: TransactionType.EXPENSE,
      amount: "",
      date: new Date(),
      tagIds: [],
    } as unknown as CreateTransactionInput,
  });

  const type = watch("type");
  const activeAccounts = accounts?.filter((a) => a.status === "ACTIVE") ?? [];

  const onSubmit = async (values: CreateTransactionInput) => {
    try {
      await createTransaction.mutateAsync(values);
      toast.success("Transaction added");
      reset(
        { type: TransactionType.EXPENSE, amount: "", date: new Date(), tagIds: [] } as unknown as CreateTransactionInput,
      );
      setOpen(false);
    } catch {
      toast.error("Could not save transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
        </DialogHeader>

        <Tabs
          value={type}
          onValueChange={(value) => setValue("type", value as CreateTransactionInput["type"])}
        >
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value={TransactionType.EXPENSE}>
              Expense
            </TabsTrigger>
            <TabsTrigger className="flex-1" value={TransactionType.INCOME}>
              Income
            </TabsTrigger>
            <TabsTrigger className="flex-1" value={TransactionType.TRANSFER}>
              Transfer
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" inputMode="decimal" placeholder="0.00" {...register("amount")} />
              {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date &amp; time</Label>
              <Input
                id="date"
                type="datetime-local"
                defaultValue={toDateTimeLocal(new Date())}
                onChange={(e) => setValue("date", new Date(e.target.value))}
              />
            </div>
          </div>

          {type !== TransactionType.TRANSFER && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Account</Label>
                <Controller
                  control={control}
                  name="accountId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {"accountId" in errors && errors.accountId && (
                  <p className="text-xs text-danger">{errors.accountId.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(type === TransactionType.EXPENSE ? expenseCategories : incomeCategories)?.map(
                          (category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {"categoryId" in errors && errors.categoryId && (
                  <p className="text-xs text-danger">{errors.categoryId.message}</p>
                )}
              </div>

              {type === TransactionType.EXPENSE ? (
                <div className="flex flex-col gap-1.5">
                  <Label>Payment method</Label>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PaymentMethod).map((method) => (
                            <SelectItem key={method} value={method}>
                              {paymentMethodLabels[method]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="source">Source</Label>
                  <Input id="source" placeholder="e.g. Company XYZ" {...register("source")} />
                </div>
              )}
            </>
          )}

          {type === TransactionType.TRANSFER && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>From account</Label>
                <Controller
                  control={control}
                  name="fromAccountId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>To account</Label>
                <Controller
                  control={control}
                  name="toAccountId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {"toAccountId" in errors && errors.toAccountId && (
                  <p className="text-xs text-danger">{errors.toAccountId.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Input id="note" placeholder="Optional" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Saving…" : "Save transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
