"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ContributeSavingGoalInput,
  CreateSavingGoalInput,
  UpdateSavingGoalInput,
} from "@finora/validation";
import type { SavingGoalStatus } from "@finora/types";

export interface SavingGoal {
  id: string;
  name: string;
  icon: string | null;
  targetAmount: string;
  currentAmount: string;
  targetDate: string | null;
  status: SavingGoalStatus;
  progress: number;
  remaining: string;
  currentSavingRate: string;
  requiredMonthlySaving: string | null;
  estimatedCompletionDate: string | null;
}

export function useSavingGoals() {
  return useQuery({
    queryKey: ["saving-goals"],
    queryFn: () => apiClient.get<SavingGoal[]>("/saving-goals"),
  });
}

export function useCreateSavingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSavingGoalInput) => apiClient.post<SavingGoal>("/saving-goals", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saving-goals"] }),
  });
}

export function useUpdateSavingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateSavingGoalInput & { id: string }) =>
      apiClient.patch<SavingGoal>(`/saving-goals/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saving-goals"] }),
  });
}

export function useContributeSavingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ContributeSavingGoalInput & { id: string }) =>
      apiClient.post<SavingGoal>(`/saving-goals/${id}/contribute`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saving-goals"] }),
  });
}

export function useDeleteSavingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/saving-goals/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saving-goals"] }),
  });
}
