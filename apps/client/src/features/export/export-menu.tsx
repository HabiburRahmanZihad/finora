"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadFile } from "@/lib/download-file";

export function ExportMenu({ basePath }: { basePath: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setLoading(true);
    try {
      const separator = basePath.includes("?") ? "&" : "?";
      await downloadFile(`${basePath}${separator}format=${format}`);
    } catch {
      toast.error("Could not export file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Download /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleExport("excel")}>Export as Excel</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
