"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { CreateFinancialAccountInput, UpdateFinancialAccountInput } from "@finora/validation";
import type { AccountStatus, AccountType } from "@finora/types";

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: string;
  currentBalance: string;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => apiClient.get<FinancialAccount[]>("/accounts"),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFinancialAccountInput) =>
      apiClient.post<FinancialAccount>("/accounts", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateFinancialAccountInput & { id: string }) =>
      apiClient.patch<FinancialAccount>(`/accounts/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/accounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  });
}
