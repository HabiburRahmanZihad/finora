"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BadgeProps } from "@/components/ui/badge";
import { useLoan, useDeleteLoan } from "@/features/loans/use-loans";
import { LoanFormDialog, loanTypeLabels, repaymentFrequencyLabels } from "@/features/loans/loan-form-dialog";
import { RecordPaymentDialog } from "@/features/loans/record-payment-dialog";
import { EditScheduleEntryDialog } from "@/features/loans/edit-schedule-entry-dialog";
import type { LoanPaymentStatus } from "@finora/types";

const statusVariant: Record<LoanPaymentStatus, BadgeProps["variant"]> = {
  PAID: "success",
  PARTIALLY_PAID: "warning",
  PENDING: "outline",
  OVERDUE: "danger",
};

const statusLabel: Record<LoanPaymentStatus, string> = {
  PAID: "Paid",
  PARTIALLY_PAID: "Partially paid",
  PENDING: "Pending",
  OVERDUE: "Overdue",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: loan, isLoading } = useLoan(id);
  const deleteLoan = useDeleteLoan();

  const handleDelete = async () => {
    if (!loan) return;
    try {
      await deleteLoan.mutateAsync(loan.id);
      toast.success("Loan deleted");
      router.push("/loans");
    } catch {
      toast.error("Could not delete loan");
    }
  };

  if (isLoading || !loan) {
    return <p className="text-sm text-muted-foreground">Loading loan…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/loans">
            <ArrowLeft className="size-4" /> Back to loans
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <LoanFormDialog loan={loan} />
          <Button
            variant="outline"
            size="sm"
            className="text-danger hover:bg-danger/10"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{loan.lenderName}</h1>
              <p className="text-sm text-muted-foreground">
                {loanTypeLabels[loan.loanType]} · {repaymentFrequencyLabels[loan.repaymentFrequency]} ·{" "}
                {loan.hasInterest ? "Interest-bearing" : "Interest-free"}
              </p>
            </div>
            <Badge variant={loan.status === "CLOSED" ? "success" : loan.hasOverdue ? "danger" : "outline"}>
              {loan.status === "CLOSED" ? "Closed" : loan.hasOverdue ? "Overdue" : "Active"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Principal</p>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(loan.principalAmount, "BDT")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding principal</p>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(loan.outstandingPrincipal, "BDT")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining interest</p>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(loan.remainingInterest, "BDT")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total payable remaining</p>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(loan.totalPayableRemaining, "BDT")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start date</p>
              <p className="text-sm font-medium text-foreground">{formatDate(loan.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End date</p>
              <p className="text-sm font-medium text-foreground">{formatDate(loan.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total paid</p>
              <p className="text-sm font-medium text-success">{formatCurrency(loan.totalPaid, "BDT")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-sm font-medium text-foreground">{loan.progress}%</p>
            </div>
          </div>

          {loan.note && <p className="text-sm text-muted-foreground">{loan.note}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repayment schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col divide-y divide-border">
            {loan.schedule.map((row) => {
              const remaining = (Number(row.totalDue) - Number(row.amountPaid)).toFixed(2);
              return (
                <div key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="w-10 shrink-0 text-sm font-medium text-foreground">#{row.installmentNumber}</div>
                  <div className="min-w-[7rem] flex-1">
                    <p className="text-sm text-foreground">{formatDate(row.dueDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      Principal {formatCurrency(row.principalComponent, "BDT")} · Interest{" "}
                      {formatCurrency(row.interestComponent, "BDT")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(row.totalDue, "BDT")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Paid {formatCurrency(row.amountPaid, "BDT")}
                    </p>
                  </div>
                  <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
                  <div className="flex items-center gap-1">
                    {row.amountPaid === "0.00" && (
                      <EditScheduleEntryDialog
                        loanId={loan.id}
                        scheduleId={row.id}
                        installmentNumber={row.installmentNumber}
                        dueDate={row.dueDate}
                        totalDue={row.totalDue}
                      />
                    )}
                    {row.status !== "PAID" && (
                      <RecordPaymentDialog
                        loanId={loan.id}
                        scheduleId={row.id}
                        installmentNumber={row.installmentNumber}
                        remainingAmount={remaining}
                        lenderName={loan.lenderName}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loan.payments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {loan.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm text-foreground">{formatDate(payment.paidDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.transaction?.account
                        ? `Paid from ${payment.transaction.account.name}`
                        : "Untracked payment"}
                      {payment.note ? ` · ${payment.note}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-success">{formatCurrency(payment.amount, "BDT")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
