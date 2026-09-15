"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { InsightSeverity } from "@finora/types";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  message: string;
  category: string | null;
  isDismissed: boolean;
  createdAt: string;
}

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: () => apiClient.get<Insight[]>("/insights"),
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/insights/${id}/dismiss`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["insights"] }),
  });
}
