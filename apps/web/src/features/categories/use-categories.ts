"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { CreateCategoryInput } from "@finora/validation";
import type { CategoryStatus, CategoryType } from "@finora/types";

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  description: string | null;
  type: CategoryType;
  status: CategoryStatus;
  isDefault: boolean;
  parentCategoryId: string | null;
}

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: () => apiClient.get<Category[]>(`/categories${type ? `?type=${type}` : ""}`),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => apiClient.post<Category>("/categories", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
