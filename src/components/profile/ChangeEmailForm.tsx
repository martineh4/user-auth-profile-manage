"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { changeEmailSchema, type ChangeEmailInput } from "@/lib/validations";

interface ChangeEmailFormProps {
  currentEmail: string;
}

export default function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
  });

  const onSubmit = async (data: ChangeEmailInput) => {
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Failed to update email");
        return;
      }

      setSuccess(true);
      reset();
      // Sign out so the user re-authenticates with the new email
      setTimeout(() => signOut({ callbackUrl: "/login?emailChanged=1" }), 2000);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {serverError}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          Email updated! Signing you out so you can log in with your new email…
        </div>
      )}

      <div>
        <label className="form-label">Current email</label>
        <input
          type="email"
          value={currentEmail}
          disabled
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="newEmail" className="form-label">
          New email address
        </label>
        <input
          id="newEmail"
          type="email"
          autoComplete="email"
          placeholder="new@example.com"
          className="form-input"
          {...register("newEmail")}
        />
        {errors.newEmail && (
          <p className="error-message">{errors.newEmail.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="emailPassword" className="form-label">
          Confirm with your password
        </label>
        <input
          id="emailPassword"
          type="password"
          autoComplete="current-password"
          placeholder="Your current password"
          className="form-input"
          {...register("password")}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <p className="text-xs text-gray-400">
        You will be signed out after changing your email and must log in again.
      </p>

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="btn-primary"
        >
          {isSubmitting ? "Updating…" : "Update email"}
        </button>
      </div>
    </form>
  );
}
