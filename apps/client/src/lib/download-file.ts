import { authClient } from "./auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Downloads a file from an authenticated API endpoint via a Bearer token. */
export async function downloadFile(path: string) {
  const { data } = await authClient.token();
  const response = await fetch(`${API_URL}${path}`, {
    headers: data?.token ? { Authorization: `Bearer ${data.token}` } : {},
  });
  if (!response.ok) throw new Error("Download failed");

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? "download";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
