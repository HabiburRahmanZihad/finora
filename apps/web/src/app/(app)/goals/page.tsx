"use client";

import { toast } from "sonner";
import { Trash2, Target } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSavingGoals, useDeleteSavingGoal } from "@/features/goals/use-saving-goals";
import { GoalFormDialog } from "@/features/goals/goal-form-dialog";
import { ContributeDialog } from "@/features/goals/contribute-dialog";

export default function GoalsPage() {
  const { data: goals, isLoading } = useSavingGoals();
  const deleteGoal = useDeleteSavingGoal();

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal.mutateAsync(id);
      toast.success("Goal removed");
    } catch {
      toast.error("Could not remove goal");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Saving Goals</h1>
          <p className="text-sm text-muted-foreground">
            Set a target, contribute over time, and track your pace toward it.
          </p>
        </div>
        <GoalFormDialog />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading goals…</p>}

      {!isLoading && (goals?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No saving goals yet. Create one to start tracking progress.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {goals?.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Target className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(goal.currentAmount, "BDT")} of{" "}
                      {formatCurrency(goal.targetAmount, "BDT")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {goal.status === "COMPLETED" && <Badge variant="success">Completed</Badge>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-danger"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <Progress value={goal.progress} tone={goal.status === "COMPLETED" ? "NORMAL" : "NORMAL"} />
              <p className="text-xs text-muted-foreground">{goal.progress}% complete</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="font-medium text-foreground">{formatCurrency(goal.remaining, "BDT")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saving rate / mo</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(goal.currentSavingRate, "BDT")}
                  </p>
                </div>
                {goal.requiredMonthlySaving && (
                  <div>
                    <p className="text-xs text-muted-foreground">Required / mo</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(goal.requiredMonthlySaving, "BDT")}
                    </p>
                  </div>
                )}
                {goal.estimatedCompletionDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Est. completion</p>
                    <p className="font-medium text-foreground">
                      {new Date(goal.estimatedCompletionDate).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {goal.status !== "COMPLETED" && (
                <div>
                  <ContributeDialog goalId={goal.id} goalName={goal.name} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
