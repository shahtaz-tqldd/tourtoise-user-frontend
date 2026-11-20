import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { PENDING_VERIFICATION_EMAIL_KEY } from "@/constants/session";
import { useRegisterMutation } from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import GoogleAuthButton from "./google-auth-button";
import FormAlert, { OrDivider, SwitchPrompt } from "./form-alert";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Account creation. On success the caller moves to OTP verification via
 * `onRegistered(email)`. Google sign-up skips verification and calls
 * `onAuthenticated` directly.
 */
const RegisterForm = ({ onRegistered, onAuthenticated, onSwitchView }) => {
  const [registerAccount, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const showError = (message) => {
    setError(message);
    setErrorKey((current) => current + 1);
  };

  const onSubmit = async (data) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, value]) => String(value).trim() !== ""),
      );
      const res = await registerAccount(payload).unwrap();
      const verificationEmail = res?.data?.email || payload.email;

      try {
        window.sessionStorage.setItem(
          PENDING_VERIFICATION_EMAIL_KEY,
          verificationEmail,
        );
      } catch {
        // The email is still passed to the verify step directly.
      }

      onRegistered(verificationEmail);
    } catch (requestError) {
      showError(getApiErrorMessage(requestError, "Failed to create account!"));
    }
  };

  return (
    <div className="space-y-5">
      <FormAlert key={errorKey}>{error}</FormAlert>

      <GoogleAuthButton onAuthenticated={onAuthenticated} onError={showError} />
      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FloatingInput {...field} label="Name" autoComplete="name" />
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <FloatingInput {...field} label="Username" autoComplete="username" />
            )}
          />
        </div>

        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
          }}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          }}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          name="confirm_password"
          control={control}
          rules={{
            required: "Confirm password is required",
            validate: (value, formValues) =>
              value === formValues.password || "Passwords do not match",
          }}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
            />
          )}
        />

        <Button type="submit" size="lg" disabled={isLoading} className="w-full">
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <SwitchPrompt
        prompt="Already have an account?"
        action="Sign in"
        onClick={() => onSwitchView("login")}
      />
    </div>
  );
};

export default RegisterForm;
