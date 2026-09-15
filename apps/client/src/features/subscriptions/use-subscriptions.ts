"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from "@finora/validation";
import type { BillingCycle, SubscriptionStatus } from "@finora/types";
import type { Category } from "@/features/categories/use-categories";
import type { FinancialAccount } from "@/features/accounts/use-accounts";

export interface Subscription {
  id: string;
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  status: SubscriptionStatus;
  category: Category | null;
  account: FinancialAccount | null;
  note: string | null;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  summary: { monthlyCost: string; yearlyCost: string };
}

export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => apiClient.get<SubscriptionsResponse>("/subscriptions"),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) =>
      apiClient.post<Subscription>("/subscriptions", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateSubscriptionInput & { id: string }) =>
      apiClient.patch<Subscription>(`/subscriptions/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/subscriptions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}
