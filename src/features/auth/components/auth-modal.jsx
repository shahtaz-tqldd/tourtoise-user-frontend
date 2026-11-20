import React from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AUTH_REASONS, AUTH_VIEW_COPY } from "../auth-gate-context";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import VerifyOtpForm from "./verify-otp-form";
import ForgotPasswordForm from "./forgot-password-form";

const AuthModal = ({
  open,
  onOpenChange,
  view,
  onSwitchView,
  reason = "default",
  email,
  onAuthenticated,
  onRegistered,
  onVerified,
}) => {
  const reasonCopy = AUTH_REASONS[reason] || AUTH_REASONS.default;
  const viewCopy = AUTH_VIEW_COPY[view] || AUTH_VIEW_COPY.login;
  const description =
    view === "verify" && email
      ? `Enter the 4-digit code we sent to ${email}.`
      : view === "login" && reason !== "default"
        ? reasonCopy.description
        : viewCopy.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] gap-0 overflow-hidden rounded-sheet border-0 p-0 shadow-overlay sm:max-w-[440px]">
        <div className="relative overflow-hidden bg-brand-mist px-6 pb-7 pt-9 text-center sm:px-8">
          <svg
            aria-hidden="true"
            viewBox="0 0 440 210"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <path
              d="M-20 180 C 70 140 110 200 190 165 C 260 134 280 70 350 92 C 395 106 415 60 460 72"
              fill="none"
              stroke="var(--color-brand-400)"
              strokeOpacity="0.4"
              strokeWidth="2.5"
              strokeDasharray="1 9"
              strokeLinecap="round"
            />
            <circle cx="190" cy="165" r="4.5" fill="var(--color-sand-400)" />
            <circle cx="350" cy="92" r="5" fill="var(--color-brand-500)" />
            <circle
              cx="404"
              cy="44"
              r="13"
              fill="var(--color-sand-300)"
              fillOpacity="0.9"
            />
            <circle
              cx="404"
              cy="44"
              r="21"
              fill="none"
              stroke="var(--color-sand-300)"
              strokeOpacity="0.45"
              strokeWidth="2.5"
              strokeDasharray="1 6"
              strokeLinecap="round"
            />
          </svg>

          <DialogClose
            className="absolute right-4 top-4 center size-9 rounded-full bg-white/80 text-subtle shadow-card backdrop-blur transition hover:bg-white hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Close"
          >
            <X size={18} />
          </DialogClose>

          <img
            src="/logo.png"
            alt=""
            className="relative mx-auto h-11 object-contain"
          />
          <DialogTitle className="relative mt-4 font-display text-h3 leading-tight text-heading md:text-h2">
            {view === "login" && reason !== "default"
              ? reasonCopy.title
              : viewCopy.title}
          </DialogTitle>
          <DialogDescription className="relative mx-auto mt-1.5 max-w-[17.5rem] text-body-sm text-subtle">
            {description}
          </DialogDescription>
        </div>

        <div className="relative max-h-[calc(100dvh-1.5rem-13rem)] overflow-y-auto bg-surface px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
          {view === "login" && (
            <LoginForm
              onAuthenticated={onAuthenticated}
              onSwitchView={onSwitchView}
            />
          )}
          {view === "register" && (
            <RegisterForm
              onAuthenticated={onAuthenticated}
              onRegistered={onRegistered}
              onSwitchView={onSwitchView}
            />
          )}
          {view === "verify" && (
            <VerifyOtpForm
              email={email}
              onVerified={onVerified}
              onSwitchView={onSwitchView}
            />
          )}
          {view === "forgot" && <ForgotPasswordForm onSwitchView={onSwitchView} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
