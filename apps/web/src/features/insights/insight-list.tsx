"use client";

import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, AlertOctagon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDismissInsight, type Insight } from "./use-insights";

const severityConfig = {
  POSITIVE: { icon: CheckCircle2, className: "bg-success/10 text-success" },
  WARNING: { icon: AlertTriangle, className: "bg-warning/10 text-warning" },
  CRITICAL: { icon: AlertOctagon, className: "bg-danger/10 text-danger" },
} as const;

export function InsightList({ insights, limit }: { insights: Insight[]; limit?: number }) {
  const dismissInsight = useDismissInsight();
  const active = insights.filter((i) => !i.isDismissed);
  const shown = limit ? active.slice(0, limit) : active;

  const handleDismiss = async (id: string) => {
    try {
      await dismissInsight.mutateAsync(id);
    } catch {
      toast.error("Could not dismiss insight");
    }
  };

  if (shown.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No insights right now — check back after a few weeks of activity.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {shown.map((insight) => {
        const config = severityConfig[insight.severity];
        const Icon = config.icon;
        return (
          <div key={insight.id} className="flex items-start gap-3 rounded-lg p-2">
            <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${config.className}`}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{insight.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 text-muted-foreground"
              onClick={() => handleDismiss(insight.id)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
