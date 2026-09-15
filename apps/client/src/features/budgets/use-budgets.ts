"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateBudgetInput, UpdateBudgetInput } from "@finora/validation";
import type { BudgetStatus } from "@finora/types";
import type { Category } from "@/features/categories/use-categories";

export interface Budget {
  id: string;
  categoryId: string;
  category: Category;
  amount: string;
  currentSpend: string;
  progress: number;
  status: BudgetStatus;
}

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient.get<Budget[]>("/budgets"),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => apiClient.post<Budget>("/budgets", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateBudgetInput & { id: string }) =>
      apiClient.patch<Budget>(`/budgets/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/budgets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
