"use client";

import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { TransactionType } from "@finora/types";
import { Button } from "@/components/ui/button";
import type { Transaction } from "./use-transactions";
import { useDeleteTransaction } from "./use-transactions";

const typeIcon = {
  [TransactionType.INCOME]: ArrowDownLeft,
  [TransactionType.EXPENSE]: ArrowUpRight,
  [TransactionType.TRANSFER]: ArrowLeftRight,
};

const typeColor = {
  [TransactionType.INCOME]: "text-success bg-success/10",
  [TransactionType.EXPENSE]: "text-danger bg-danger/10",
  [TransactionType.TRANSFER]: "text-accent bg-accent/10",
};

function describe(transaction: Transaction) {
  if (transaction.type === TransactionType.TRANSFER) {
    return `${transaction.fromAccount?.name ?? "?"} → ${transaction.toAccount?.name ?? "?"}`;
  }
  return transaction.category?.name ?? transaction.account?.name ?? "—";
}

export function TransactionList({
  transactions,
  showDelete = true,
}: {
  transactions: Transaction[];
  showDelete?: boolean;
}) {
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Could not delete transaction");
    }
  };

  if (transactions.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {transactions.map((transaction) => {
        const Icon = typeIcon[transaction.type];
        const sign =
          transaction.type === TransactionType.EXPENSE
            ? "-"
            : transaction.type === TransactionType.INCOME
              ? "+"
              : "";
        return (
          <div key={transaction.id} className="flex items-center gap-3 py-3">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${typeColor[transaction.type]}`}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{describe(transaction)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {transaction.note ? ` · ${transaction.note}` : ""}
              </p>
            </div>
            <p
              className={`shrink-0 text-sm font-semibold ${
                transaction.type === TransactionType.EXPENSE
                  ? "text-danger"
                  : transaction.type === TransactionType.INCOME
                    ? "text-success"
                    : "text-foreground"
              }`}
            >
              {sign}
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-danger"
                onClick={() => handleDelete(transaction.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
