"use client";

import { toast } from "sonner";
import { RefreshCw, Trash2 } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeleteSubscription, useSubscriptions } from "@/features/subscriptions/use-subscriptions";
import { SubscriptionFormDialog } from "@/features/subscriptions/subscription-form-dialog";

export default function SubscriptionsPage() {
  const { data, isLoading } = useSubscriptions();
  const deleteSubscription = useDeleteSubscription();

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription.mutateAsync(id);
      toast.success("Subscription removed");
    } catch {
      toast.error("Could not remove subscription");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Recurring subscriptions and their cost.</p>
        </div>
        <SubscriptionFormDialog />
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:max-w-md sm:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Monthly cost</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(data.summary.monthlyCost, "BDT")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Yearly cost</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(data.summary.yearlyCost, "BDT")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && (data?.subscriptions.length ?? 0) === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No subscriptions tracked yet.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.subscriptions.map((sub) => (
          <Card key={sub.id}>
            <CardContent className="flex items-start justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <RefreshCw className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(sub.amount, "BDT")} / {sub.billingCycle === "MONTHLY" ? "mo" : "yr"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next: {new Date(sub.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-danger"
                onClick={() => handleDelete(sub.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
