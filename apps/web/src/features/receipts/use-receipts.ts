"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface Receipt {
  id: string;
  transactionId: string | null;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export function useUploadReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, transactionId }: { file: File; transactionId?: string }) => {
      const { data } = await authClient.token();
      const form = new FormData();
      form.append("file", file);
      const url = new URL(`${API_URL}/receipts`);
      if (transactionId) url.searchParams.set("transactionId", transactionId);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: data?.token ? { Authorization: `Bearer ${data.token}` } : {},
        body: form,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json() as Promise<Receipt>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await authClient.token();
      const response = await fetch(`${API_URL}/receipts/${id}`, {
        method: "DELETE",
        headers: data?.token ? { Authorization: `Bearer ${data.token}` } : {},
      });
      if (!response.ok) throw new Error("Delete failed");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export async function fetchReceiptBlobUrl(fileUrl: string): Promise<string> {
  const { data } = await authClient.token();
  const response = await fetch(`${API_URL}${fileUrl}`, {
    headers: data?.token ? { Authorization: `Bearer ${data.token}` } : {},
  });
  if (!response.ok) throw new Error("Could not load receipt");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
