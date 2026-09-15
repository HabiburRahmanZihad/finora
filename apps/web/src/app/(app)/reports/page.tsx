"use client";

import { formatCurrency } from "@finora/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatRow } from "@/features/reports/stat-row";
import { ExpenseByCategoryChart } from "@/features/dashboard/expense-by-category-chart";
import { MonthlyTrendChart } from "@/features/dashboard/monthly-trend-chart";
import { useDailyReport, useMonthlyReport, useYearlyReport } from "@/features/reports/use-reports";
import { ExportMenu } from "@/features/export/export-menu";

const statusVariant = { NORMAL: "success", WARNING: "warning", EXCEEDED: "danger" } as const;

function DailyReportView() {
  const { data, isLoading } = useDailyReport();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-5">
          <StatRow
            items={[
              { label: "Today's Income", value: formatCurrency(data.todayIncome, "BDT") },
              { label: "Today's Expense", value: formatCurrency(data.todayExpense, "BDT") },
              { label: "Today's Saving", value: formatCurrency(data.todaySaving, "BDT") },
              { label: "Transactions", value: String(data.transactionCount) },
              {
                label: "Highest Expense",
                value: data.highestExpense
                  ? `${formatCurrency(data.highestExpense.amount, "BDT")} (${data.highestExpense.categoryName ?? "—"})`
                  : "—",
              },
              {
                label: "vs 30-day average",
                value: `${data.comparisonPercent > 0 ? "+" : ""}${data.comparisonPercent}%`,
              },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Category breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseByCategoryChart data={data.categoryBreakdown} />
        </CardContent>
      </Card>
    </div>
  );
}

function MonthlyReportView() {
  const { data, isLoading } = useMonthlyReport();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ExportMenu basePath="/export/monthly-report" />
      </div>
      <Card>
        <CardContent className="p-5">
          <StatRow
            items={[
              { label: "Total Income", value: formatCurrency(data.totalIncome, "BDT") },
              { label: "Total Expense", value: formatCurrency(data.totalExpense, "BDT") },
              { label: "Total Saving", value: formatCurrency(data.totalSaving, "BDT") },
              { label: "Savings Rate", value: `${data.savingsRate}%` },
              { label: "Avg Daily Expense", value: formatCurrency(data.averageDailyExpense, "BDT") },
              {
                label: "Highest Spending Day",
                value: data.highestSpendingDay
                  ? `${formatCurrency(data.highestSpendingDay.amount, "BDT")} on ${data.highestSpendingDay.date}`
                  : "—",
              },
              {
                label: "vs Previous Month (Income)",
                value:
                  data.previousMonthComparison.incomeChangePercent === null
                    ? "—"
                    : `${data.previousMonthComparison.incomeChangePercent > 0 ? "+" : ""}${data.previousMonthComparison.incomeChangePercent}%`,
              },
              {
                label: "vs Previous Month (Expense)",
                value:
                  data.previousMonthComparison.expenseChangePercent === null
                    ? "—"
                    : `${data.previousMonthComparison.expenseChangePercent > 0 ? "+" : ""}${data.previousMonthComparison.expenseChangePercent}%`,
              },
              {
                label: "Highest Spending Category",
                value: data.highestSpendingCategory?.categoryName ?? "—",
              },
            ]}
          />
        </CardContent>
      </Card>

      {data.budgetPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.budgetPerformance.map((b) => (
              <div key={b.categoryName} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{b.categoryName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {formatCurrency(b.spent, "BDT")} / {formatCurrency(b.budget, "BDT")}
                  </span>
                  <Badge variant={statusVariant[b.status as keyof typeof statusVariant]}>
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category-wise spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseByCategoryChart data={data.categoryBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={data.monthlyTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function YearlyReportView() {
  const { data, isLoading } = useYearlyReport();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-5">
          <StatRow
            items={[
              { label: "Annual Income", value: formatCurrency(data.annualIncome, "BDT") },
              { label: "Annual Expense", value: formatCurrency(data.annualExpense, "BDT") },
              { label: "Annual Saving", value: formatCurrency(data.annualSaving, "BDT") },
              { label: "Savings Rate", value: `${data.savingsRate}%` },
              { label: "Avg Monthly Income", value: formatCurrency(data.averageMonthlyIncome, "BDT") },
              { label: "Avg Monthly Expense", value: formatCurrency(data.averageMonthlyExpense, "BDT") },
              { label: "Best Saving Month", value: data.bestSavingMonth?.month ?? "—" },
              { label: "Highest Spending Month", value: data.highestSpendingMonth?.month ?? "—" },
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category-wise yearly spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseByCategoryChart data={data.categoryBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Annual trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={data.monthlyComparison} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Daily, monthly and yearly breakdowns.</p>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <DailyReportView />
        </TabsContent>
        <TabsContent value="monthly">
          <MonthlyReportView />
        </TabsContent>
        <TabsContent value="yearly">
          <YearlyReportView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
