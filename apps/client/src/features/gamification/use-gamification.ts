"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
}

export interface GamificationSummary {
  savingStreakMonths: number;
  noSpendStreakDays: number;
  noSpendDaysThisMonth: number;
  achievements: Achievement[];
}

export function useGamification() {
  return useQuery({
    queryKey: ["gamification"],
    queryFn: () => apiClient.get<GamificationSummary>("/gamification"),
  });
}
