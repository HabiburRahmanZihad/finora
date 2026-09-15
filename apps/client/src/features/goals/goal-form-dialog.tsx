"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createSavingGoalSchema, type CreateSavingGoalInput } from "@finora/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateSavingGoal } from "./use-saving-goals";

export function GoalFormDialog() {
  const [open, setOpen] = useState(false);
  const createGoal = useCreateSavingGoal();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSavingGoalInput>({ resolver: zodResolver(createSavingGoalSchema) });

  const onSubmit = async (values: CreateSavingGoalInput) => {
    try {
      await createGoal.mutateAsync(values);
      toast.success("Saving goal created");
      reset();
      setOpen(false);
    } catch {
      toast.error("Could not create saving goal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a saving goal</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Goal name</Label>
            <Input id="name" placeholder="e.g. MacBook" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="targetAmount">Target amount</Label>
              <Input id="targetAmount" inputMode="decimal" placeholder="150000" {...register("targetAmount")} />
              {errors.targetAmount && (
                <p className="text-xs text-danger">{errors.targetAmount.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentAmount">Starting amount</Label>
              <Input id="currentAmount" inputMode="decimal" placeholder="0" {...register("currentAmount")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetDate">Target date (optional)</Label>
            <Input id="targetDate" type="date" {...register("targetDate")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGoal.isPending}>
              {createGoal.isPending ? "Creating…" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
