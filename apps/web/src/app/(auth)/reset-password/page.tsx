"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type NewPasswordInput = z.infer<typeof newPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordInput>({ resolver: zodResolver(newPasswordSchema) });

  const onSubmit = async (values: NewPasswordInput) => {
    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Could not reset your password");
      return;
    }

    toast.success("Password updated. Please sign in.");
    router.push("/login");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Set a new password</CardTitle>
      </CardHeader>
      <CardContent>
        {!token ? (
          <p className="text-sm text-danger">
            This reset link is invalid or has expired. Request a new one from the{" "}
            <Link href="/forgot-password" className="font-medium underline">
              forgot password
            </Link>{" "}
            page.
          </p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
