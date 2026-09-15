"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { WhatIfInput } from "@finora/validation";
import type { MonthlyTrendPoint } from "@/features/dashboard/use-dashboard";

export interface SpendingAnalytics {
  currentMonthExpense: string;
  previousMonthExpense: string;
  changePercent: number | null;
  averageDailySpending: string;
  spendingFrequency: number;
  highestSpendingDay: { date: string; amount: string } | null;
  weekdayVsWeekend: { weekday: string; weekend: string };
  trend3Month: MonthlyTrendPoint[];
  trend6Month: MonthlyTrendPoint[];
  trendYearly: MonthlyTrendPoint[];
}

export interface SavingsAnalytics {
  currentMonthSavings: string;
  previousMonthSavings: string;
  savingsGrowthPercent: number | null;
  incomeGrowthPercent: number | null;
  savingsRateTrend: { month: string; savingsRate: number }[];
}

export interface CategoryAnalyticsItem {
  categoryId: string;
  categoryName: string;
  currentMonthAmount: string;
  previousMonthAmount: string;
  changePercent: number | null;
}

export interface CategoryAnalytics {
  categories: CategoryAnalyticsItem[];
  highestSpendingCategory: CategoryAnalyticsItem | null;
}

export interface Forecast {
  daysElapsed: number;
  daysInMonth: number;
  currentExpense: string;
  averageDailyRate: string;
  estimatedMonthEndExpense: string;
}

export interface WhatIfResult {
  categoryName: string;
  currentMonthlyAmount: string;
  percentChange: number;
  newMonthlyAmount: string;
  monthlySaving: string;
  yearlySaving: string;
}

export function useSpendingAnalytics() {
  return useQuery({
    queryKey: ["analytics", "spending"],
    queryFn: () => apiClient.get<SpendingAnalytics>("/analytics/spending"),
  });
}

export function useSavingsAnalytics() {
  return useQuery({
    queryKey: ["analytics", "savings"],
    queryFn: () => apiClient.get<SavingsAnalytics>("/analytics/savings"),
  });
}

export function useCategoryAnalytics() {
  return useQuery({
    queryKey: ["analytics", "categories"],
    queryFn: () => apiClient.get<CategoryAnalytics>("/analytics/categories"),
  });
}

export function useForecast() {
  return useQuery({
    queryKey: ["forecast"],
    queryFn: () => apiClient.get<Forecast>("/forecast"),
  });
}

export function useWhatIf() {
  return useMutation({
    mutationFn: (input: WhatIfInput) => apiClient.post<WhatIfResult>("/what-if", input),
  });
}
