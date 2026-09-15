"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "@finora/validation";
import type { RecurrenceFrequency, RecurringStatus, TransactionType } from "@finora/types";
import type { Category } from "@/features/categories/use-categories";
import type { FinancialAccount } from "@/features/accounts/use-accounts";

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  category: Category | null;
  account: FinancialAccount | null;
  frequency: RecurrenceFrequency;
  customInterval: number | null;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  status: RecurringStatus;
  note: string | null;
}

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ["recurring-transactions"],
    queryFn: () => apiClient.get<RecurringTransaction[]>("/recurring-transactions"),
  });
}

export function useUpcomingRecurring(days = 14) {
  return useQuery({
    queryKey: ["recurring-transactions", "upcoming", days],
    queryFn: () => apiClient.get<RecurringTransaction[]>(`/recurring-transactions/upcoming?days=${days}`),
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecurringTransactionInput) =>
      apiClient.post<RecurringTransaction>("/recurring-transactions", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] }),
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateRecurringTransactionInput & { id: string }) =>
      apiClient.patch<RecurringTransaction>(`/recurring-transactions/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] }),
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/recurring-transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] }),
  });
}
