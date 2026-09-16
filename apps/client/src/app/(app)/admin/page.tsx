"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatRow } from "@/features/reports/stat-row";
import { TrafficChart } from "@/features/admin/traffic-chart";
import { useAdminHealth, useAdminStats, useAdminTraffic } from "@/features/admin/use-admin";

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function AdminOverviewPage() {
  const { data: health } = useAdminHealth();
  const { data: stats } = useAdminStats();
  const { data: traffic } = useAdminTraffic();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Site health, traffic, and user management.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Manage users</Link>
        </Button>
      </div>

      {health && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Site Health</CardTitle>
            <Badge variant={health.status === "ok" ? "success" : "danger"}>{health.status}</Badge>
          </CardHeader>
          <CardContent>
            <StatRow
              items={[
                { label: "DB Latency", value: `${health.dbLatencyMs} ms` },
                { label: "Uptime", value: formatUptime(health.uptimeSeconds) },
                { label: "Memory (RSS)", value: formatBytes(health.memory.rssBytes) },
                { label: "Heap Used", value: formatBytes(health.memory.heapUsedBytes) },
                { label: "Node Version", value: health.nodeVersion },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <StatRow
              items={[
                { label: "Total Users", value: String(stats.totalUsers) },
                { label: "New Users (7d)", value: String(stats.newUsersLast7Days) },
                { label: "New Users (30d)", value: String(stats.newUsersLast30Days) },
                { label: "Active Users (30d)", value: String(stats.activeUsersLast30Days) },
                { label: "Transactions", value: String(stats.totalTransactions) },
                { label: "Budgets", value: String(stats.totalBudgets) },
                { label: "Saving Goals", value: String(stats.totalSavingGoals) },
                { label: "Subscriptions", value: String(stats.totalSubscriptions) },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {traffic && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Requests — last 14 days</CardTitle>
            </CardHeader>
            <CardContent>
              {traffic.requestsPerDay.length > 0 ? (
                <TrafficChart data={traffic.requestsPerDay} />
              ) : (
                <p className="text-sm text-muted-foreground">No traffic recorded yet.</p>
              )}
              <div className="mt-4">
                <StatRow items={[{ label: "Avg Response Time", value: `${traffic.averageDurationMs} ms` }]} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Routes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {traffic.topRoutes.length === 0 && (
                <p className="text-sm text-muted-foreground">No traffic recorded yet.</p>
              )}
              {traffic.topRoutes.map((route) => (
                <div key={route.path} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate text-foreground">{route.path}</span>
                  <span className="ml-3 shrink-0 text-muted-foreground">{route.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {traffic && traffic.statusBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status Codes — last 14 days</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {traffic.statusBreakdown.map((row) => (
              <Badge key={row.statusClass} variant={row.statusClass === "2xx" ? "success" : "warning"}>
                {row.statusClass}: {row.count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
