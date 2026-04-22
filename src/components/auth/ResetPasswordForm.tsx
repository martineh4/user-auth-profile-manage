"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetInput = z.infer<typeof resetSchema>;

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetInput) => {
    setServerError(null);

    const { error } = await authClient.resetPassword({
      newPassword: data.newPassword,
      token,
    });

    if (error) {
      setServerError(error.message ?? "Failed to reset password");
      return;
    }

    router.push("/login?passwordReset=1");
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-medium">Invalid reset link.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-pink-600 hover:underline text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
          <p className="mt-2 text-sm text-gray-500">Choose a strong password for your account.</p>
        </div>

        <div className="card p-8">
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {serverError}{" "}
              {serverError.includes("expired") && (
                <Link href="/forgot-password" className="underline">Request a new link.</Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="form-label">New password</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="form-input"
                {...register("newPassword")}
              />
              {errors.newPassword && <p className="error-message">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                className="form-input"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
