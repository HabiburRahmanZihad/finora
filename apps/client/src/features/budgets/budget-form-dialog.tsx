"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { z } from "zod";
import { createBudgetSchema, type CreateBudgetInput } from "@finora/validation";
import { CategoryType } from "@finora/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBudget, type Budget } from "./use-budgets";
import { useCategories } from "@/features/categories/use-categories";

export function BudgetFormDialog({ existingBudgets }: { existingBudgets: Budget[] }) {
  const [open, setOpen] = useState(false);
  const createBudget = useCreateBudget();
  const { data: categories } = useCategories(CategoryType.EXPENSE);
  const budgetedCategoryIds = new Set(existingBudgets.map((b) => b.categoryId));
  const availableCategories = categories?.filter((c) => !budgetedCategoryIds.has(c.id)) ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof createBudgetSchema>, unknown, z.output<typeof createBudgetSchema>>({
    resolver: zodResolver(createBudgetSchema),
  });

  const onSubmit = async (values: CreateBudgetInput) => {
    try {
      await createBudget.mutateAsync(values);
      toast.success("Budget created");
      reset();
      setOpen(false);
    } catch {
      toast.error("Could not create budget");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={availableCategories.length === 0}>
          <Plus /> Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set a monthly budget</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Monthly amount</Label>
            <Input id="amount" inputMode="decimal" placeholder="e.g. 8000" {...register("amount")} />
            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBudget.isPending}>
              {createBudget.isPending ? "Saving…" : "Set budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
