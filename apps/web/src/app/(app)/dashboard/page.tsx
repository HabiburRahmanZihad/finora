import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {session?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s your financial overview.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Balance, income, expense, savings, charts and insights land here in Phase 3
          once accounts, categories and transactions (Phase 2) are wired up.
        </CardContent>
      </Card>
    </div>
  );
}
