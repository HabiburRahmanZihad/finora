"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { contributeSavingGoalSchema, type ContributeSavingGoalInput } from "@finora/validation";
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
import { useContributeSavingGoal } from "./use-saving-goals";

export function ContributeDialog({ goalId, goalName }: { goalId: string; goalName: string }) {
  const [open, setOpen] = useState(false);
  const contribute = useContributeSavingGoal();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof contributeSavingGoalSchema>,
    unknown,
    z.output<typeof contributeSavingGoalSchema>
  >({ resolver: zodResolver(contributeSavingGoalSchema) });

  const onSubmit = async (values: ContributeSavingGoalInput) => {
    try {
      await contribute.mutateAsync({ id: goalId, ...values });
      toast.success("Contribution added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Could not add contribution");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add money</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contribute to &ldquo;{goalName}&rdquo;</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" inputMode="decimal" placeholder="0.00" {...register("amount")} />
            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="e.g. Bonus" {...register("note")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={contribute.isPending}>
              {contribute.isPending ? "Saving…" : "Add contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
