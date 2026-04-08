"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { deleteAccountSchema, type DeleteAccountInput } from "@/lib/validations";

export default function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const onSubmit = async (data: DeleteAccountInput) => {
    setServerError(null);

    try {
      const res = await fetch("/api/profile/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Failed to delete account");
        return;
      }

      await signOut({ callbackUrl: "/login" });
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setServerError(null);
    reset();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Permanently delete your account and all associated data. This action
        cannot be undone.
      </p>

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="btn-danger"
        >
          Delete my account
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-800">
            Are you sure? This will permanently delete your account and cannot be undone.
          </p>

          {serverError && (
            <div className="rounded-lg bg-white px-4 py-3 text-sm text-red-700 border border-red-200">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="deletePassword" className="form-label">
              Enter your password to confirm
            </label>
            <input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              className="form-input"
              {...register("password")}
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-danger"
            >
              {isSubmitting ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
