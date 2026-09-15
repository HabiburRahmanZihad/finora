import Link from "next/link";
import { Target } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SavingGoal } from "@/features/goals/use-saving-goals";

export function SavingGoalsWidget({
  goals,
  isLoading,
}: {
  goals: SavingGoal[];
  isLoading?: boolean;
}) {
  const activeGoals = goals.filter((g) => g.status === "ACTIVE").slice(0, 3);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Saving Goals</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/goals">View all</Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : activeGoals.length === 0 ? (
          <p className="text-xs text-muted-foreground">Create a saving goal to track progress here.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{goal.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.currentAmount, "BDT")} / {formatCurrency(goal.targetAmount, "BDT")}
                  </span>
                </div>
                <Progress value={goal.progress} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
