"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBudgets, useDeleteBudget } from "@/features/budgets/use-budgets";
import { BudgetFormDialog } from "@/features/budgets/budget-form-dialog";

const statusVariant = { NORMAL: "success", WARNING: "warning", EXCEEDED: "danger" } as const;
const statusLabel = { NORMAL: "On track", WARNING: "Warning", EXCEEDED: "Exceeded" } as const;

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useBudgets();
  const deleteBudget = useDeleteBudget();

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget.mutateAsync(id);
      toast.success("Budget removed");
    } catch {
      toast.error("Could not remove budget");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            Category-wise monthly budgets — 80% warns, 100%+ is exceeded.
          </p>
        </div>
        <BudgetFormDialog existingBudgets={budgets ?? []} />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading budgets…</p>}

      {!isLoading && (budgets?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No budgets set yet. Set one to start tracking category spending.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets?.map((budget) => (
          <Card key={budget.id}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{budget.category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(budget.currentSpend, "BDT")} of{" "}
                    {formatCurrency(budget.amount, "BDT")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={statusVariant[budget.status]}>{statusLabel[budget.status]}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-danger"
                    onClick={() => handleDelete(budget.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <Progress
                value={budget.progress}
                tone={budget.status}
              />
              <p className="text-xs text-muted-foreground">{budget.progress}% used</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
