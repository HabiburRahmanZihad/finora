"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, HeartPulse, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useDashboardSummary,
  useExpenseByCategory,
  useMonthlyTrend,
  type TimeFilterPreset,
} from "@/features/dashboard/use-dashboard";
import { SummaryCards } from "@/features/dashboard/summary-cards";
import { TimeFilter } from "@/features/dashboard/time-filter";
import { ExpenseByCategoryChart } from "@/features/dashboard/expense-by-category-chart";
import { MonthlyTrendChart } from "@/features/dashboard/monthly-trend-chart";
import { BudgetStatusWidget } from "@/features/dashboard/budget-status-widget";
import { SavingGoalsWidget } from "@/features/dashboard/saving-goals-widget";
import { useTransactions } from "@/features/transactions/use-transactions";
import { TransactionList } from "@/features/transactions/transaction-list";
import { TransactionFormDialog } from "@/features/transactions/transaction-form-dialog";
import { TransactionType } from "@finora/types";
import { useBudgets } from "@/features/budgets/use-budgets";
import { useSavingGoals } from "@/features/goals/use-saving-goals";

function PlaceholderCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Lightbulb;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}>View</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [preset, setPreset] = useState<TimeFilterPreset>("this_month");

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(preset);
  const { data: expenseByCategory } = useExpenseByCategory(preset);
  const { data: monthlyTrend } = useMonthlyTrend(6);
  const { data: recentTransactions } = useTransactions({ pageSize: 5, sort: "newest" });
  const { data: budgets } = useBudgets();
  const { data: goals } = useSavingGoals();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your financial situation at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <TransactionFormDialog
            defaultType={TransactionType.EXPENSE}
            trigger={
              <Button variant="outline" size="sm">
                <ArrowUpRight className="text-danger" /> Quick Add Expense
              </Button>
            }
          />
          <TransactionFormDialog
            defaultType={TransactionType.INCOME}
            trigger={
              <Button variant="outline" size="sm">
                <ArrowDownLeft className="text-success" /> Quick Add Income
              </Button>
            }
          />
        </div>
      </div>

      <TimeFilter value={preset} onChange={setPreset} />

      {summaryLoading || !summary ? (
        <p className="text-sm text-muted-foreground">Loading summary…</p>
      ) : (
        <SummaryCards summary={summary} />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlaceholderCard
          icon={HeartPulse}
          title="Financial Health"
          description="Coming in a later phase — a 0–100 score from your habits."
          href="/settings"
        />
        <PlaceholderCard
          icon={Lightbulb}
          title="Financial Insights"
          description="Rule-based insights ('Food spending up 25%') land here soon."
          href="/insights"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseByCategoryChart data={expenseByCategory ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income, Expense &amp; Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={monthlyTrend ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BudgetStatusWidget budgets={budgets ?? []} />
        <SavingGoalsWidget goals={goals ?? []} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={recentTransactions?.items ?? []} showDelete={false} />
        </CardContent>
      </Card>
    </div>
  );
}
