"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateTransactionInput,
  TransactionQueryInput,
  UpdateTransactionInput,
} from "@finora/validation";
import type { PaginatedResult } from "@finora/types";
import type { PaymentMethod, TransactionType } from "@finora/types";
import type { FinancialAccount } from "@/features/accounts/use-accounts";
import type { Category } from "@/features/categories/use-categories";

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  currency: string;
  accountId: string | null;
  account: FinancialAccount | null;
  fromAccountId: string | null;
  fromAccount: FinancialAccount | null;
  toAccountId: string | null;
  toAccount: FinancialAccount | null;
  categoryId: string | null;
  category: Category | null;
  date: string;
  paymentMethod: PaymentMethod | null;
  source: string | null;
  note: string | null;
  location: string | null;
  tags: { tag: Tag }[];
  createdAt: string;
}

function toQueryString(query: Partial<TransactionQueryInput>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value instanceof Date ? value.toISOString() : String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useTransactions(query: Partial<TransactionQueryInput> = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(query),
    queryFn: () =>
      apiClient.get<PaginatedResult<Transaction>>(`/transactions${toQueryString(query)}`),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      apiClient.post<Transaction>("/transactions", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTransactionInput & { id: string }) =>
      apiClient.patch<Transaction>(`/transactions/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
