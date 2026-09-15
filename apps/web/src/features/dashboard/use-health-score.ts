"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface HealthScoreBreakdownItem {
  score: number;
  weight: number;
}

export interface HealthScore {
  score: number;
  breakdown: {
    savingsRate: HealthScoreBreakdownItem;
    expenseToIncomeRatio: HealthScoreBreakdownItem;
    budgetPerformance: HealthScoreBreakdownItem;
    spendingStability: HealthScoreBreakdownItem;
    savingGoalProgress: HealthScoreBreakdownItem;
  };
  note: string;
}

export function useHealthScore() {
  return useQuery({
    queryKey: ["health-score"],
    queryFn: () => apiClient.get<HealthScore>("/health-score"),
  });
}
