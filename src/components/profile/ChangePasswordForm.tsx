"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations";

export default function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Failed to update password");
        return;
      }

      setSuccess(true);
      reset();
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
          Password updated successfully!
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className="form-label">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="Your current password"
          className="form-input"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="error-message">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="form-label">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          className="form-input"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="error-message">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmNewPassword" className="form-label">
          Confirm new password
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter new password"
          className="form-input"
          {...register("confirmNewPassword")}
        />
        {errors.confirmNewPassword && (
          <p className="error-message">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="btn-primary"
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
