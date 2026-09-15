"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createCategorySchema, type CreateCategoryInput } from "@finora/validation";
import { CategoryType } from "@finora/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCategories, useCreateCategory, useArchiveCategory } from "./use-categories";

export function CategoryManager() {
  const [type, setType] = useState<CategoryType>(CategoryType.EXPENSE);
  const { data: categories, isLoading } = useCategories(type);
  const createCategory = useCreateCategory();
  const archiveCategory = useArchiveCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { type: CategoryType.EXPENSE },
  });

  const onSubmit = async (values: CreateCategoryInput) => {
    try {
      await createCategory.mutateAsync(values);
      toast.success("Category created");
      reset({ name: "", type: values.type });
    } catch {
      toast.error("Could not create category");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveCategory.mutateAsync(id);
      toast.success("Category archived");
    } catch {
      toast.error("Default categories can't be archived");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <Input placeholder="e.g. Pets" className="w-40" {...register("name")} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setType(value as CategoryType);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CategoryType.EXPENSE}>Expense</SelectItem>
                  <SelectItem value={CategoryType.INCOME}>Income</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Button type="submit" disabled={createCategory.isPending}>
          <Plus /> Add
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <Button
          variant={type === CategoryType.EXPENSE ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setType(CategoryType.EXPENSE)}
        >
          Expense categories
        </Button>
        <Button
          variant={type === CategoryType.INCOME ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setType(CategoryType.INCOME)}
        >
          Income categories
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <Badge key={category.id} variant="outline" className="gap-2 py-1.5 pl-3 pr-1.5">
              {category.name}
              {!category.isDefault && (
                <button
                  type="button"
                  onClick={() => handleArchive(category.id)}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Archive ${category.name}`}
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
