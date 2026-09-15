import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Budget } from "@/features/budgets/use-budgets";

export function BudgetStatusWidget({ budgets }: { budgets: Budget[] }) {
  const topBudgets = [...budgets].sort((a, b) => b.progress - a.progress).slice(0, 3);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Budget Status</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/budgets">View all</Link>
          </Button>
        </div>

        {budgets.length === 0 ? (
          <p className="text-xs text-muted-foreground">Set category budgets to see progress here.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topBudgets.map((budget) => (
              <div key={budget.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{budget.category.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(budget.currentSpend, "BDT")} / {formatCurrency(budget.amount, "BDT")}
                  </span>
                </div>
                <Progress value={budget.progress} tone={budget.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
