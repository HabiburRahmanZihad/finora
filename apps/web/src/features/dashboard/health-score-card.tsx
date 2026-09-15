import { HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { HealthScore } from "./use-health-score";

function scoreColor(score: number) {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-danger";
}

export function HealthScoreCard({ health }: { health: HealthScore | undefined }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary">
          <HeartPulse className="size-6 text-secondary-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Financial Health</p>
          {health ? (
            <p className={`text-3xl font-semibold ${scoreColor(health.score)}`}>
              {health.score} <span className="text-base text-muted-foreground">/ 100</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
