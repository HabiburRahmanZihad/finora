"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useInsights } from "@/features/insights/use-insights";
import { InsightList } from "@/features/insights/insight-list";

export default function InsightsPage() {
  const { data: insights, isLoading } = useInsights();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Rule-based observations from your spending, budgets and savings.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <InsightList insights={insights ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
