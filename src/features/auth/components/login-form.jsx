import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { useLoginMutation } from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import GoogleAuthButton from "./google-auth-button";
import FormAlert, { OrDivider, SwitchPrompt } from "./form-alert";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email/password + Google sign-in. Used by the auth modal and the /login page.
 * Sessions are always remembered. `onAuthenticated({ accessToken, refreshToken })`
 * is called on success.
 */
const LoginForm = ({ onAuthenticated, onSwitchView, successMessage }) => {
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const showError = (message) => {
    setError(message);
    setErrorKey((current) => current + 1);
  };

  const onSubmit = async (data) => {
    try {
      const res = await login({
        email: data.email,
        password: data.password,
        remember_me: true,
      }).unwrap();

      if (res.success && res.data) {
        setError("");
        onAuthenticated({
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
        });
      }
    } catch (requestError) {
      showError(getApiErrorMessage(requestError));
    }
  };

  return (
    <div className="space-y-5">
      <FormAlert key={errorKey}>{error}</FormAlert>
      {!error && <FormAlert tone="success">{successMessage}</FormAlert>}

      <GoogleAuthButton onAuthenticated={onAuthenticated} onError={showError} />
      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              autoComplete="current-password"
              error={errors.password?.message}
            />
          )}
        />

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => onSwitchView("forgot")}
            className="text-body-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" disabled={isLoading} className="w-full">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <SwitchPrompt
        prompt="New to tourtoise?"
        action="Create an account"
        onClick={() => onSwitchView("register")}
      />
    </div>
  );
};

export default LoginForm;
