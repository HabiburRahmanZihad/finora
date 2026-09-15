import { Wallet, TrendingUp, TrendingDown, PiggyBank, Percent } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSummary } from "./use-dashboard";

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground";
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 shrink-0" />
          <p className="text-xs font-medium">{label}</p>
        </div>
        <p className={`wrap-break-word text-lg font-semibold leading-tight sm:text-xl ${toneClass}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ summary }: { summary: DashboardSummary; currency?: string }) {
  const currency = "BDT";
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard icon={Wallet} label="Total Balance" value={formatCurrency(summary.totalBalance, currency)} />
      <StatCard
        icon={TrendingUp}
        label="Total Income"
        value={formatCurrency(summary.totalIncome, currency)}
        tone="success"
      />
      <StatCard
        icon={TrendingDown}
        label="Total Expense"
        value={formatCurrency(summary.totalExpense, currency)}
        tone="danger"
      />
      <StatCard
        icon={PiggyBank}
        label="Total Savings"
        value={formatCurrency(summary.totalSavings, currency)}
        tone={Number(summary.totalSavings) < 0 ? "danger" : "success"}
      />
      <StatCard icon={Percent} label="Savings Rate" value={`${summary.savingsRate}%`} />
    </div>
  );
}
