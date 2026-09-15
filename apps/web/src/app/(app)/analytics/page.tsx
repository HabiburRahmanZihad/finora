"use client";

import { formatCurrency } from "@finora/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatRow } from "@/features/reports/stat-row";
import { MonthlyTrendChart } from "@/features/dashboard/monthly-trend-chart";
import { WhatIfSimulator } from "@/features/analytics/what-if-simulator";
import {
  useCategoryAnalytics,
  useForecast,
  useSavingsAnalytics,
  useSpendingAnalytics,
} from "@/features/analytics/use-analytics";

function ChangeBadge({ percent }: { percent: number | null }) {
  if (percent === null) return <span className="text-xs text-muted-foreground">—</span>;
  const positive = percent >= 0;
  return (
    <Badge variant={positive ? "danger" : "success"}>
      {positive ? "+" : ""}
      {percent}%
    </Badge>
  );
}

export default function AnalyticsPage() {
  const { data: spending } = useSpendingAnalytics();
  const { data: savings } = useSavingsAnalytics();
  const { data: categories } = useCategoryAnalytics();
  const { data: forecast } = useForecast();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Deeper trends behind your spending and saving habits.
        </p>
      </div>

      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Day {forecast.daysElapsed} of {forecast.daysInMonth} — spent{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(forecast.currentExpense, "BDT")}
              </span>{" "}
              so far.
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              You&apos;re on track to spend approximately{" "}
              <span className="text-primary">{formatCurrency(forecast.estimatedMonthEndExpense, "BDT")}</span>{" "}
              this month.
            </p>
          </CardContent>
        </Card>
      )}

      {spending && (
        <Card>
          <CardHeader>
            <CardTitle>Spending Analytics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <StatRow
              items={[
                { label: "This Month", value: formatCurrency(spending.currentMonthExpense, "BDT") },
                { label: "Last Month", value: formatCurrency(spending.previousMonthExpense, "BDT") },
                {
                  label: "Change",
                  value:
                    spending.changePercent === null
                      ? "—"
                      : `${spending.changePercent > 0 ? "+" : ""}${spending.changePercent}%`,
                },
                { label: "Avg Daily Spending", value: formatCurrency(spending.averageDailySpending, "BDT") },
                { label: "Spending Frequency", value: `${spending.spendingFrequency} tx/day` },
                {
                  label: "Highest Spending Day",
                  value: spending.highestSpendingDay
                    ? `${formatCurrency(spending.highestSpendingDay.amount, "BDT")} on ${spending.highestSpendingDay.date}`
                    : "—",
                },
                { label: "Weekday Spending", value: formatCurrency(spending.weekdayVsWeekend.weekday, "BDT") },
                { label: "Weekend Spending", value: formatCurrency(spending.weekdayVsWeekend.weekend, "BDT") },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {savings && (
        <Card>
          <CardHeader>
            <CardTitle>Savings Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <StatRow
              items={[
                { label: "This Month Savings", value: formatCurrency(savings.currentMonthSavings, "BDT") },
                { label: "Last Month Savings", value: formatCurrency(savings.previousMonthSavings, "BDT") },
                {
                  label: "Savings Growth",
                  value:
                    savings.savingsGrowthPercent === null
                      ? "—"
                      : `${savings.savingsGrowthPercent > 0 ? "+" : ""}${savings.savingsGrowthPercent}%`,
                },
                {
                  label: "Income Growth",
                  value:
                    savings.incomeGrowthPercent === null
                      ? "—"
                      : `${savings.incomeGrowthPercent > 0 ? "+" : ""}${savings.incomeGrowthPercent}%`,
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {categories && categories.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Growth</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {categories.categories.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{category.categoryName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {formatCurrency(category.currentMonthAmount, "BDT")}
                  </span>
                  <ChangeBadge percent={category.changePercent} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What-If Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <WhatIfSimulator />
        </CardContent>
      </Card>

      {spending && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>3-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={spending.trend3Month} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={spending.trend6Month} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Yearly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={spending.trendYearly} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
