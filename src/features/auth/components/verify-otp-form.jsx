import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PENDING_VERIFICATION_EMAIL_KEY } from "@/constants/session";
import { useVerifyOTPMutation } from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import FormAlert, { SwitchPrompt } from "./form-alert";

const OTP_LENGTH = 4;

/** 4-digit email verification. Calls `onVerified(tokens)` on success. */
const VerifyOtpForm = ({ email, onVerified, onSwitchView }) => {
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const inputs = useRef([]);
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    );
    setError("");
    if (digit && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const value = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!value) return;

    event.preventDefault();
    setDigits(Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || ""));
    inputs.current[Math.min(value.length, OTP_LENGTH) - 1]?.focus();
    setError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const otp = digits.join("");

    if (!email) {
      setError("Your verification session has expired. Please register again.");
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }

    try {
      const response = await verifyOTP({ email, otp }).unwrap();
      const accountData = response?.data || {};

      if (!accountData.access_token || !accountData.refresh_token) {
        throw new Error("Verification succeeded without login tokens.");
      }

      try {
        window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
      } catch {
        // Session storage may be unavailable in restricted browsers.
      }

      onVerified({
        accessToken: accountData.access_token,
        refreshToken: accountData.refresh_token,
        rememberMe: true,
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "The verification code is invalid or expired.",
        ),
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            // The position is the stable identity of each OTP box.
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            value={digit}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={index === 0}
            aria-label={`Verification code digit ${index + 1}`}
            className="size-14 rounded-control border border-line-strong bg-surface text-center font-display text-h2 text-heading outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            maxLength={1}
          />
        ))}
      </div>

      <FormAlert>{error}</FormAlert>

      <Button
        type="submit"
        size="lg"
        disabled={isLoading || digits.some((digit) => !digit)}
        className="w-full"
      >
        {isLoading ? "Verifying..." : "Verify and continue"}
      </Button>

      <SwitchPrompt
        prompt="Wrong email?"
        action="Register again"
        onClick={() => onSwitchView("register")}
      />
    </form>
  );
};

export default VerifyOtpForm;
