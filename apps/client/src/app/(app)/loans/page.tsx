"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLoans, useDeleteLoan } from "@/features/loans/use-loans";
import { LoanFormDialog, loanTypeLabels } from "@/features/loans/loan-form-dialog";

export default function LoansPage() {
  const { data, isLoading } = useLoans();
  const deleteLoan = useDeleteLoan();

  const handleDelete = async (id: string) => {
    try {
      await deleteLoan.mutateAsync(id);
      toast.success("Loan deleted");
    } catch {
      toast.error("Could not delete loan");
    }
  };

  const loans = data?.loans ?? [];
  const summary = data?.summary;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Loans</h1>
          <p className="text-sm text-muted-foreground">
            Money you&apos;ve borrowed, with auto-generated repayment schedules.
          </p>
        </div>
        <LoanFormDialog />
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Total Borrowed</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(summary.totalBorrowed, "BDT")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(summary.totalOutstanding, "BDT")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-lg font-semibold text-success">
                {formatCurrency(summary.totalPaid, "BDT")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Overdue Installments</p>
              <p className="text-lg font-semibold text-danger">{summary.overdueInstallmentCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading loans…</p>}

      {!isLoading && loans.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No loans tracked yet. Add one to generate its repayment schedule.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => {
          const statusVariant = loan.status === "CLOSED" ? "success" : loan.hasOverdue ? "danger" : "outline";
          const statusLabel = loan.status === "CLOSED" ? "Closed" : loan.hasOverdue ? "Overdue" : "Active";
          const progressTone = loan.status === "CLOSED" || !loan.hasOverdue ? "NORMAL" : "EXCEEDED";

          return (
            <Link key={loan.id} href={`/loans/${loan.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{loan.lenderName}</p>
                      <p className="text-xs text-muted-foreground">{loanTypeLabels[loan.loanType]}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(loan.id);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatCurrency(loan.totalPaid, "BDT")} paid of{" "}
                      {formatCurrency(loan.principalAmount, "BDT")}
                    </span>
                    <span className="font-medium text-foreground">{loan.progress}%</span>
                  </div>
                  <Progress value={loan.progress} tone={progressTone} />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Outstanding: {formatCurrency(loan.outstandingPrincipal, "BDT")}</span>
                    {loan.nextDueInstallment && (
                      <span>
                        Next due {new Date(loan.nextDueInstallment.dueDate).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
