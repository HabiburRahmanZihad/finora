"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AdminHealth {
  status: string;
  dbLatencyMs: number;
  uptimeSeconds: number;
  memory: { rssBytes: number; heapUsedBytes: number; heapTotalBytes: number };
  nodeVersion: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  activeUsersLast30Days: number;
  totalTransactions: number;
  totalBudgets: number;
  totalSavingGoals: number;
  totalSubscriptions: number;
}

export interface AdminTraffic {
  requestsPerDay: { date: string; count: number }[];
  topRoutes: { path: string; count: number }[];
  statusBreakdown: { statusClass: string; count: number }[];
  averageDurationMs: number;
}

export function useAdminHealth() {
  return useQuery({
    queryKey: ["admin", "health"],
    queryFn: () => apiClient.get<AdminHealth>("/admin/health"),
    refetchInterval: 30_000,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get<AdminStats>("/admin/stats"),
  });
}

export function useAdminTraffic() {
  return useQuery({
    queryKey: ["admin", "traffic"],
    queryFn: () => apiClient.get<AdminTraffic>("/admin/traffic"),
  });
}
