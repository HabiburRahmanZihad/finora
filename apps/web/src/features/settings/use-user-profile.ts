"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateUserProfileInput } from "@finora/validation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  settings: {
    defaultCurrency: string;
    language: string;
    timezone: string;
    dateFormat: string;
    notifyBudgetWarning: boolean;
    notifyBudgetExceeded: boolean;
    notifyUpcomingRecurring: boolean;
    notifySavingGoalReminder: boolean;
    notifySubscriptionReminder: boolean;
    notifyFinancialInsight: boolean;
    notifyMonthlyReport: boolean;
  };
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiClient.get<UserProfile>("/users/me"),
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => apiClient.patch<UserProfile>("/users/me", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
}
