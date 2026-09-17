"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { adminSetPasswordSchema, type AdminSetPasswordInput } from "@finora/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatRow } from "@/features/reports/stat-row";
import { useAdminSetPassword, useAdminSetRole, useAdminUser } from "@/features/admin/use-admin-users";

function ResetPasswordDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const setPassword = useAdminSetPassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminSetPasswordInput>({ resolver: zodResolver(adminSetPasswordSchema) });

  const onSubmit = async (values: AdminSetPasswordInput) => {
    try {
      await setPassword.mutateAsync({ userId, newPassword: values.newPassword });
      toast.success("Password reset");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reset password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reset password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset user password</DialogTitle>
          <DialogDescription>Sets a new password for this user immediately.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              placeholder="••••••••"
              {...register("newPassword")}
            />
            {errors.newPassword && <p className="text-xs text-danger">{errors.newPassword.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={setPassword.isPending}>
              {setPassword.isPending ? "Saving…" : "Set new password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { data: user, isLoading } = useAdminUser(userId);
  const setRole = useAdminSetRole();

  const handleRoleChange = async (role: string) => {
    if (role !== "admin" && role !== "user") return;
    try {
      await setRole.mutateAsync({ userId, role });
      toast.success(`Role updated to ${role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change role");
    }
  };

  if (isLoading || !user) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role ?? "user"}</Badge>
        {user.banned && <Badge variant="danger">Banned</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <StatRow
            items={[
              { label: "User ID", value: user.id },
              { label: "Email Verified", value: user.emailVerified ? "Yes" : "No" },
              { label: "Joined", value: new Date(user.createdAt).toLocaleString() },
              { label: "Status", value: user.banned ? "Banned" : "Active" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={user.role ?? "user"} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResetPasswordDialog userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
