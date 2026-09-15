"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionType } from "@finora/types";
import { useTransactions } from "@/features/transactions/use-transactions";
import { TransactionFormDialog } from "@/features/transactions/transaction-form-dialog";
import { TransactionList } from "@/features/transactions/transaction-list";

export default function TransactionsPage() {
  const [type, setType] = useState<TransactionType | "ALL">("ALL");
  const { data, isLoading } = useTransactions({
    ...(type !== "ALL" ? { type } : {}),
    pageSize: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Every income, expense and transfer in one place.
          </p>
        </div>
        <TransactionFormDialog />
      </div>

      <div className="flex items-center gap-3">
        <Select value={type} onValueChange={(v) => setType(v as TransactionType | "ALL")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
            <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
            <SelectItem value={TransactionType.TRANSFER}>Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading transactions…</p>
          ) : (
            <TransactionList transactions={data?.items ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
