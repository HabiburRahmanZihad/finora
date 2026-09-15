"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type TimeFilterPreset = "today" | "this_week" | "this_month" | "this_year";

export interface DashboardSummary {
  totalBalance: string;
  totalIncome: string;
  totalExpense: string;
  totalSavings: string;
  savingsRate: number;
}

export interface ExpenseByCategory {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  amount: string;
}

export interface MonthlyTrendPoint {
  month: string;
  income: string;
  expense: string;
  savings: string;
}

export function useDashboardSummary(preset: TimeFilterPreset) {
  return useQuery({
    queryKey: ["dashboard", "summary", preset],
    queryFn: () => apiClient.get<DashboardSummary>(`/dashboard/summary?preset=${preset}`),
  });
}

export function useExpenseByCategory(preset: TimeFilterPreset) {
  return useQuery({
    queryKey: ["dashboard", "expense-by-category", preset],
    queryFn: () =>
      apiClient.get<ExpenseByCategory[]>(`/dashboard/expense-by-category?preset=${preset}`),
  });
}

export function useMonthlyTrend(months = 6) {
  return useQuery({
    queryKey: ["dashboard", "monthly-trend", months],
    queryFn: () => apiClient.get<MonthlyTrendPoint[]>(`/dashboard/monthly-trend?months=${months}`),
  });
}
