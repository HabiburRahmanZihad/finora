"use client";

import { Bell, BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/use-notifications";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Budget, subscription and goal reminders.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (notifications?.length ?? 0) === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {notifications?.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
              className={`flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted ${
                n.isRead ? "" : "bg-secondary/40"
              }`}
            >
              <div className="mt-0.5 text-muted-foreground">
                {n.isRead ? <Bell className="size-4" /> : <BellRing className="size-4 text-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
