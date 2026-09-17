import Link from "next/link";
import { HandCoins } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Loan } from "@/features/loans/use-loans";

export function LoanSummaryWidget({
  loans,
  isLoading,
}: {
  loans: Loan[];
  isLoading?: boolean;
}) {
  const upcoming = loans
    .filter((loan) => loan.status === "ACTIVE" && loan.nextDueInstallment)
    .sort(
      (a, b) =>
        new Date(a.nextDueInstallment!.dueDate).getTime() - new Date(b.nextDueInstallment!.dueDate).getTime(),
    )
    .slice(0, 3);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Loan Repayments</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/loans">View all</Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active loans with upcoming payments.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-foreground">{loan.lenderName}</p>
                  <p className="text-muted-foreground">
                    Due {new Date(loan.nextDueInstallment!.dueDate).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {formatCurrency(loan.nextDueInstallment!.totalDue, "BDT")}
                  </span>
                  {loan.hasOverdue && <Badge variant="danger">Overdue</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
