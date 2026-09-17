"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import type { z } from "zod";
import { updateLoanScheduleEntrySchema, type UpdateLoanScheduleEntryInput } from "@finora/validation";
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
import { useUpdateLoanScheduleEntry } from "./use-loans";

export function EditScheduleEntryDialog({
  loanId,
  scheduleId,
  installmentNumber,
  dueDate,
  totalDue,
}: {
  loanId: string;
  scheduleId: string;
  installmentNumber: number;
  dueDate: string;
  totalDue: string;
}) {
  const [open, setOpen] = useState(false);
  const updateEntry = useUpdateLoanScheduleEntry();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof updateLoanScheduleEntrySchema>,
    unknown,
    z.output<typeof updateLoanScheduleEntrySchema>
  >({
    resolver: zodResolver(updateLoanScheduleEntrySchema),
    defaultValues: { dueDate: dueDate.slice(0, 10) as unknown as Date, totalDue },
  });

  const onSubmit = async (values: UpdateLoanScheduleEntryInput) => {
    try {
      await updateEntry.mutateAsync({ loanId, scheduleId, ...values });
      toast.success("Installment updated");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update installment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit installment #{installmentNumber}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="totalDue">Amount due</Label>
            <Input id="totalDue" inputMode="decimal" {...register("totalDue")} />
            {errors.totalDue && <p className="text-xs text-danger">{errors.totalDue.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateEntry.isPending}>
              {updateEntry.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
