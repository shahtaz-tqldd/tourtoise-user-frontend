import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { useRequestResetPasswordMutation } from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const ForgotPasswordPage = () => {
  const [requestResetPassword, { isLoading }] =
    useRequestResetPasswordMutation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errorAnimationKey, setErrorAnimationKey] = useState(0);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await requestResetPassword({ email: data.email }).unwrap();
      setError("");
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (error) {
      console.error("Password reset request failed:", error);
      setSuccess("");
      setError(getApiErrorMessage(error, "Failed to request password reset!"));
      setErrorAnimationKey((current) => current + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-6 sm:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-10">
            <img src="/logo.png" className="h-12 object-contain mb-2" />
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Reset password
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email and we will send reset instructions.
            </p>
          </div>

          {error && (
            <div
              key={errorAnimationKey}
              className="error-bounce mb-6 -mt-4 rounded-lg border border-red-200 bg-red-100 p-2 text-center text-xs"
            >
              <span className="text-red-500">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 -mt-4 rounded-lg border border-green-200 bg-green-100 p-2 text-center text-xs">
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Email Address"
                  type="email"
                  error={errors.email?.message}
                />
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full h-11">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered your password?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
