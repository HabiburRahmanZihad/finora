import type { TransactionQueryInput } from "@finora/validation";

export const queryKeys = {
  accounts: ["accounts"] as const,
  categories: (type?: string) => ["categories", type ?? "all"] as const,
  tags: ["tags"] as const,
  transactions: (query: Partial<TransactionQueryInput>) => ["transactions", query] as const,
  me: ["me"] as const,
};
