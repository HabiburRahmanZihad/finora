"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Paperclip, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchReceiptBlobUrl, useDeleteReceipt } from "./use-receipts";
import type { TransactionReceipt } from "@/features/transactions/use-transactions";

function ReceiptRow({ receipt }: { receipt: TransactionReceipt }) {
  const deleteReceipt = useDeleteReceipt();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    fetchReceiptBlobUrl(receipt.fileUrl)
      .then((url) => {
        revoke = url;
        setBlobUrl(url);
      })
      .catch(() => undefined);
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [receipt.fileUrl]);

  const handleDelete = async () => {
    try {
      await deleteReceipt.mutateAsync(receipt.id);
      toast.success("Receipt deleted");
    } catch {
      toast.error("Could not delete receipt");
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-2">
      {receipt.mimeType.startsWith("image/") && blobUrl ? (
        <img src={blobUrl} alt={receipt.fileName} className="size-12 rounded-md object-cover" />
      ) : (
        <div className="flex size-12 items-center justify-center rounded-md bg-muted">
          <Paperclip className="size-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{receipt.fileName}</p>
        <p className="text-xs text-muted-foreground">{Math.round(receipt.fileSize / 1024)} KB</p>
      </div>
      {blobUrl && (
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <a href={blobUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
          </a>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-danger"
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function ReceiptViewerDialog({ receipts }: { receipts: TransactionReceipt[] }) {
  const [open, setOpen] = useState(false);
  if (receipts.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground">
          <Paperclip className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receipts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {receipts.map((receipt) => (
            <ReceiptRow key={receipt.id} receipt={receipt} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
