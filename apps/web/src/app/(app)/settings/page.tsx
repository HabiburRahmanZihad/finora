"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CategoryManager } from "@/features/categories/category-manager";
import { useMe, useUpdateMe } from "@/features/settings/use-user-profile";
import type { UpdateUserProfileInput } from "@finora/validation";

const notificationFields: { key: keyof UpdateUserProfileInput; label: string }[] = [
  { key: "notifyBudgetWarning", label: "Budget warning (80% reached)" },
  { key: "notifyBudgetExceeded", label: "Budget exceeded" },
  { key: "notifyUpcomingRecurring", label: "Upcoming recurring transactions" },
  { key: "notifySavingGoalReminder", label: "Saving goal reminders" },
  { key: "notifySubscriptionReminder", label: "Subscription reminders" },
  { key: "notifyFinancialInsight", label: "New financial insights" },
  { key: "notifyMonthlyReport", label: "Monthly report available" },
];

export default function SettingsPage() {
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();
  const { register, handleSubmit, reset, watch, setValue } = useForm<UpdateUserProfileInput>();

  useEffect(() => {
    if (me) {
      reset({
        name: me.name,
        defaultCurrency: me.settings.defaultCurrency,
        language: me.settings.language,
        timezone: me.settings.timezone,
        dateFormat: me.settings.dateFormat,
        notifyBudgetWarning: me.settings.notifyBudgetWarning,
        notifyBudgetExceeded: me.settings.notifyBudgetExceeded,
        notifyUpcomingRecurring: me.settings.notifyUpcomingRecurring,
        notifySavingGoalReminder: me.settings.notifySavingGoalReminder,
        notifySubscriptionReminder: me.settings.notifySubscriptionReminder,
        notifyFinancialInsight: me.settings.notifyFinancialInsight,
        notifyMonthlyReport: me.settings.notifyMonthlyReport,
      });
    }
  }, [me, reset]);

  const onSubmitProfile = async (values: UpdateUserProfileInput) => {
    try {
      await updateMe.mutateAsync({
        name: values.name,
        defaultCurrency: values.defaultCurrency,
        language: values.language,
        timezone: values.timezone,
        dateFormat: values.dateFormat,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    }
  };

  const toggleNotification = async (key: keyof UpdateUserProfileInput, value: boolean) => {
    setValue(key, value);
    try {
      await updateMe.mutateAsync({ [key]: value });
    } catch {
      toast.error("Could not update preference");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Profile, preferences and categories.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmitProfile)}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input value={me?.email ?? ""} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="defaultCurrency">Default currency</Label>
              <Input id="defaultCurrency" maxLength={3} {...register("defaultCurrency")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...register("timezone")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="language">Language</Label>
              <Input id="language" {...register("language")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dateFormat">Date format</Label>
              <Input id="dateFormat" {...register("dateFormat")} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={updateMe.isPending}>
                {updateMe.isPending ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {notificationFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{field.label}</span>
              <Switch
                checked={Boolean(watch(field.key))}
                onCheckedChange={(checked) => toggleNotification(field.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager />
        </CardContent>
      </Card>
    </div>
  );
}
