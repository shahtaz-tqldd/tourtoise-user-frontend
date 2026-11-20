import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { useRequestResetPasswordMutation } from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import FormAlert, { SwitchPrompt } from "./form-alert";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordForm = ({ onSwitchView }) => {
  const [requestResetPassword, { isLoading }] =
    useRequestResetPasswordMutation();
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [success, setSuccess] = useState("");

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async (data) => {
    try {
      await requestResetPassword({ email: data.email }).unwrap();
      setError("");
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (requestError) {
      setSuccess("");
      setError(
        getApiErrorMessage(requestError, "Failed to request password reset!"),
      );
      setErrorKey((current) => current + 1);
    }
  };

  return (
    <div className="space-y-5">
      <FormAlert key={errorKey}>{error}</FormAlert>
      <FormAlert tone="success">{success}</FormAlert>

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

        <Button type="submit" size="lg" disabled={isLoading} className="w-full">
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <SwitchPrompt
        prompt="Remembered your password?"
        action="Sign in"
        onClick={() => onSwitchView("login")}
      />
    </div>
  );
};

export default ForgotPasswordForm;
