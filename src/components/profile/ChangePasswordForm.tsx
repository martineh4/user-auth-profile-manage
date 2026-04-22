"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ChangePasswordForm() {
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const email = session?.user?.email ?? "";

  const handleSendReset = async () => {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (error) {
        setErrorMsg(error.message ?? "Failed to send reset email");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) =>
        first + "*".repeat(Math.min(middle.length, 4)) + domain
      )
    : "";

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        We&apos;ll send a password reset link to{" "}
        <span className="font-medium text-gray-900">{maskedEmail}</span>.
        Click the link in the email to set a new password — no need to know your current one.
      </p>

      {status === "sent" ? (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          Reset link sent! Check your inbox.{" "}
          <span className="text-green-600 text-xs">(Check the server console in development.)</span>
        </div>
      ) : (
        <>
          {status === "error" && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {errorMsg}
            </div>
          )}
          <button
            type="button"
            disabled={status === "loading" || !email}
            onClick={handleSendReset}
            className="btn-primary"
          >
            {status === "loading" ? "Sending…" : "Send password reset email"}
          </button>
        </>
      )}
    </div>
  );
}
