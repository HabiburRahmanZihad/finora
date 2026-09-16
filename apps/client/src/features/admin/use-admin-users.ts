"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt: string | Date;
}

export function useAdminUsers(searchValue: string) {
  return useQuery({
    queryKey: ["admin", "users", searchValue],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: 50,
          sortBy: "createdAt",
          sortDirection: "desc",
          ...(searchValue ? { searchField: "email" as const, searchValue } : {}),
        },
      });
      if (error) throw new Error(error.message ?? "Failed to load users");
      return data as { users: AdminUser[]; total: number };
    },
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", "detail", userId],
    queryFn: async () => {
      const { data, error } = await authClient.admin.getUser({ query: { id: userId } });
      if (error) throw new Error(error.message ?? "Failed to load user");
      return data as AdminUser;
    },
    enabled: Boolean(userId),
  });
}

export function useAdminSetPassword() {
  return useMutation({
    mutationFn: async (input: { userId: string; newPassword: string }) => {
      const { error } = await authClient.admin.setUserPassword(input);
      if (error) throw new Error(error.message ?? "Failed to reset password");
    },
  });
}

export function useAdminSetRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; role: "admin" | "user" }) => {
      const { error } = await authClient.admin.setRole(input);
      if (error) throw new Error(error.message ?? "Failed to change role");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "detail", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
