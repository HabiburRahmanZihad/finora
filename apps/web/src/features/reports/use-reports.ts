"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ExpenseByCategory, MonthlyTrendPoint } from "@/features/dashboard/use-dashboard";

export interface DailyReport {
  date: string;
  todayIncome: string;
  todayExpense: string;
  todaySaving: string;
  transactionCount: number;
  highestExpense: { amount: string; categoryName: string | null; note: string | null } | null;
  categoryBreakdown: ExpenseByCategory[];
  averageDailySpending: string;
  comparisonPercent: number;
}

export interface MonthlyReport {
  totalIncome: string;
  totalExpense: string;
  totalSaving: string;
  savingsRate: number;
  categoryBreakdown: ExpenseByCategory[];
  budgetPerformance: { categoryName: string; budget: string; spent: string; status: string }[];
  previousMonthComparison: { incomeChangePercent: number | null; expenseChangePercent: number | null };
  averageDailyExpense: string;
  highestSpendingDay: { date: string; amount: string } | null;
  highestSpendingCategory: ExpenseByCategory | null;
  monthlyTrend: MonthlyTrendPoint[];
}

export interface YearlyReport {
  annualIncome: string;
  annualExpense: string;
  annualSaving: string;
  averageMonthlyIncome: string;
  averageMonthlyExpense: string;
  savingsRate: number;
  bestSavingMonth: { month: string; savings: string } | null;
  highestSpendingMonth: { month: string; expense: string } | null;
  categoryBreakdown: ExpenseByCategory[];
  monthlyComparison: MonthlyTrendPoint[];
}

export function useDailyReport() {
  return useQuery({
    queryKey: ["reports", "daily"],
    queryFn: () => apiClient.get<DailyReport>("/reports/daily"),
  });
}

export function useMonthlyReport() {
  return useQuery({
    queryKey: ["reports", "monthly"],
    queryFn: () => apiClient.get<MonthlyReport>("/reports/monthly"),
  });
}

export function useYearlyReport() {
  return useQuery({
    queryKey: ["reports", "yearly"],
    queryFn: () => apiClient.get<YearlyReport>("/reports/yearly"),
  });
}
