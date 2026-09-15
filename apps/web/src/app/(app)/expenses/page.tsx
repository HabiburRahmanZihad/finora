"use client";

import { TransactionType } from "@finora/types";
import { TypedTransactionsView } from "@/features/transactions/typed-transactions-view";

export default function ExpensesPage() {
  return (
    <TypedTransactionsView
      type={TransactionType.EXPENSE}
      title="Expenses"
      description="Everything you've spent, by category and account."
    />
  );
}
