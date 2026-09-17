import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api-client";

export interface DashboardSummary {
  totalBalance: string;
  totalIncome: string;
  totalExpense: string;
  totalSavings: string;
  savingsRate: number;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiClient.get<DashboardSummary>("/dashboard/summary"),
  });
}
