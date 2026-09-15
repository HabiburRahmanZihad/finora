"use client";

import { TransactionType } from "@finora/types";
import { TypedTransactionsView } from "@/features/transactions/typed-transactions-view";

export default function IncomePage() {
  return (
    <TypedTransactionsView
      type={TransactionType.INCOME}
      title="Income"
      description="Salary, freelance, business and every other source of income."
    />
  );
}
