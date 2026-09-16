"use client";

import { toast } from "sonner";
import { Repeat, Trash2 } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteRecurringTransaction, useRecurringTransactions } from "@/features/recurring/use-recurring";
import { RecurringFormDialog } from "@/features/recurring/recurring-form-dialog";

const frequencyLabels: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  CUSTOM: "Custom",
};

export default function RecurringPage() {
  const { data: recurring, isLoading } = useRecurringTransactions();
  const deleteRecurring = useDeleteRecurringTransaction();

  const handleDelete = async (id: string) => {
    try {
      await deleteRecurring.mutateAsync(id);
      toast.success("Recurring transaction removed");
    } catch {
      toast.error("Could not remove recurring transaction");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Recurring</h1>
          <p className="text-sm text-muted-foreground">
            Salary, rent, bills — transactions that repeat automatically.
          </p>
        </div>
        <RecurringFormDialog />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && (recurring?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No recurring transactions yet.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recurring?.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-start justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Repeat className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.category?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(item.amount, "BDT")} · {frequencyLabels[item.frequency]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next: {new Date(item.nextRunDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {item.status !== "ACTIVE" && <Badge variant="outline">{item.status}</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
