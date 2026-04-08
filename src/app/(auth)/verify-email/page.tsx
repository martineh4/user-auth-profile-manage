import { Suspense } from "react";
import VerifyEmailContent from "@/components/auth/VerifyEmailContent";

export const metadata = { title: "Verify Email — AuthProfile" };

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
