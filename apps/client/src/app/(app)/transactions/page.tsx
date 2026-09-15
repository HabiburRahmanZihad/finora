"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionType } from "@finora/types";
import { useTransactions } from "@/features/transactions/use-transactions";
import { TransactionFormDialog } from "@/features/transactions/transaction-form-dialog";
import { TransactionList } from "@/features/transactions/transaction-list";
import { ExportMenu } from "@/features/export/export-menu";

export default function TransactionsPage() {
  const [type, setType] = useState<TransactionType | "ALL">("ALL");
  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useTransactions({
    ...(type !== "ALL" ? { type } : {}),
    ...(search ? { search } : {}),
    sort,
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
        <div className="flex items-center gap-2">
          <ExportMenu basePath="/export/transactions" />
          <TransactionFormDialog />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as TransactionType | "ALL")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
            <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
            <SelectItem value={TransactionType.TRANSFER}>Transfer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="highest">Highest amount</SelectItem>
            <SelectItem value="lowest">Lowest amount</SelectItem>
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
