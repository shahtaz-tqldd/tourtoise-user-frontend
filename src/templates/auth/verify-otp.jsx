"use client";

import { useSearchParams } from "next/navigation";
import { PENDING_VERIFICATION_EMAIL_KEY } from "@/constants/session";
import AuthContainer from "./components/container";
import VerifyOtpForm from "@/features/auth/components/verify-otp-form";
import useAuthPage from "./use-auth-page";

const getPendingEmail = (paramEmail) => {
  if (paramEmail) return paramEmail;

  try {
    return window.sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

const VerifyOTPPage = () => {
  const { switchView, signIn } = useAuthPage();
  const searchParams = useSearchParams();
  const email = getPendingEmail(searchParams?.get("email"));

  return (
    <AuthContainer
      title="Verify your email"
      description={
        email
          ? `Enter the 4-digit code sent to ${email}.`
          : "Enter the code from your verification email."
      }
    >
      <VerifyOtpForm
        email={email}
        onVerified={(tokens) => signIn(tokens, "/onboarding")}
        onSwitchView={switchView}
      />
    </AuthContainer>
  );
};

export default VerifyOTPPage;
