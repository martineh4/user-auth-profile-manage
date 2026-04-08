"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent");
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendStatus("loading");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendStatus(res.ok ? "sent" : "error");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
          <svg className="h-8 w-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {error ? (
          <div className="card p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid or expired link</h1>
            <p className="text-sm text-gray-500 mb-6">
              This verification link is invalid or has already been used. Request a new one below.
            </p>
            {renderResendForm(email, setEmail, resendStatus, handleResend)}
          </div>
        ) : sent ? (
          <div className="card p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              In development, check the server console for the preview link.
            </p>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500 mb-3">Didn&apos;t get it? Resend:</p>
              {renderResendForm(email, setEmail, resendStatus, handleResend)}
            </div>
          </div>
        ) : (
          <div className="card p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verify your email</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email to receive a new verification link.
            </p>
            {renderResendForm(email, setEmail, resendStatus, handleResend)}
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">
          <Link href="/login" className="text-pink-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

function renderResendForm(
  email: string,
  setEmail: (v: string) => void,
  status: "idle" | "loading" | "sent" | "error",
  handleResend: (e: React.FormEvent) => void
) {
  if (status === "sent") {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
        Verification email sent! Check your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={handleResend} className="space-y-3">
      {status === "error" && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          Failed to send. Please try again.
        </div>
      )}
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-input text-left"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full"
      >
        {status === "loading" ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}
