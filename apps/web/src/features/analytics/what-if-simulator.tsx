"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { formatCurrency } from "@finora/utils";
import { CategoryType } from "@finora/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/features/categories/use-categories";
import { useWhatIf, type WhatIfResult } from "./use-analytics";

export function WhatIfSimulator() {
  const { data: categories } = useCategories(CategoryType.EXPENSE);
  const whatIf = useWhatIf();
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const { control, register, handleSubmit } = useForm<{ categoryId: string; percentChange: number }>({
    defaultValues: { percentChange: -20 },
  });

  const onSubmit = async (values: { categoryId: string; percentChange: number }) => {
    if (!values.categoryId) return;
    const data = await whatIf.mutateAsync(values);
    setResult(data);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Controller
            control={control}
            name="categoryId"
            rules={{ required: true }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="percentChange">Change spending by (%)</Label>
          <Input
            id="percentChange"
            type="number"
            step="1"
            placeholder="-20"
            {...register("percentChange", { valueAsNumber: true })}
          />
        </div>
      </div>
      <Button type="submit" disabled={whatIf.isPending} className="self-start">
        {whatIf.isPending ? "Calculating…" : "Simulate"}
      </Button>

      {result && (
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Current / mo</p>
            <p className="font-semibold text-foreground">
              {formatCurrency(result.currentMonthlyAmount, "BDT")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">New / mo</p>
            <p className="font-semibold text-foreground">{formatCurrency(result.newMonthlyAmount, "BDT")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly saving</p>
            <p
              className={`font-semibold ${Number(result.monthlySaving) >= 0 ? "text-success" : "text-danger"}`}
            >
              {formatCurrency(result.monthlySaving, "BDT")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Yearly saving</p>
            <p
              className={`font-semibold ${Number(result.yearlySaving) >= 0 ? "text-success" : "text-danger"}`}
            >
              {formatCurrency(result.yearlySaving, "BDT")}
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
