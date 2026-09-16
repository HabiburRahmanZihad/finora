"use client";

import { toast } from "sonner";
import { MoreVertical, Archive } from "lucide-react";
import { formatCurrency } from "@finora/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccounts, useArchiveAccount } from "@/features/accounts/use-accounts";
import { AccountFormDialog } from "@/features/accounts/account-form-dialog";
import { accountTypeIcons, accountTypeLabels } from "@/features/accounts/account-labels";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const archiveAccount = useArchiveAccount();

  const handleArchive = async (id: string) => {
    try {
      await archiveAccount.mutateAsync(id);
      toast.success("Account archived");
    } catch {
      toast.error("Could not archive account");
    }
  };

  const activeAccounts = accounts?.filter((a) => a.status === "ACTIVE") ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Cash, bank, mobile wallets and everything else you track money in.
          </p>
        </div>
        <AccountFormDialog />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading accounts…</p>}

      {!isLoading && activeAccounts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No accounts yet. Add your first account to start tracking transactions.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeAccounts.map((account) => {
          const Icon = accountTypeIcons[account.type];
          const balance = Number(account.currentBalance);
          return (
            <Card key={account.id}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {accountTypeLabels[account.type]}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleArchive(account.id)}>
                        <Archive className="size-4" /> Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <p
                    className={`text-2xl font-semibold ${balance < 0 ? "text-danger" : "text-foreground"}`}
                  >
                    {formatCurrency(account.currentBalance, account.currency)}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {account.currency}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
