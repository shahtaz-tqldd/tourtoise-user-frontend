import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { useRegisterMutation } from "@/features/auth/authApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const RegisterPage = () => {
  const [registerAccount, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState("");
  const [errorAnimationKey, setErrorAnimationKey] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const onSubmit = async (data) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, value]) => String(value).trim() !== ""),
      );
      const res = await registerAccount(payload).unwrap();
      const accountData = res?.data || {};

      if (accountData.access_token && accountData.refresh_token) {
        dispatch(
          userLoggedIn({
            accessToken: accountData.access_token,
            refreshToken: accountData.refresh_token,
            rememberMe: false,
          }),
        );
        navigate("/", { replace: true });
        return;
      }

      navigate("/login", {
        replace: true,
        state: { message: "Account created. Sign in to continue." },
      });
    } catch (error) {
      console.error("Registration failed:", error);
      setError(getApiErrorMessage(error, "Failed to create account!"));
      setErrorAnimationKey((current) => current + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-6 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-10">
            <img src="/logo.png" className="h-12 object-contain mb-2" />
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Create account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Register to start using your tourtoise account.
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller
              name="name"
              control={control}
              render={({ field }) => <FloatingInput {...field} label="Name" />}
            />

            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label="Username" />
              )}
            />

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

            <Controller
              name="password"
              control={control}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Password"
                  type="password"
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
                  label="Confirm Password"
                  type="password"
                  error={errors.confirm_password?.message}
                />
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full h-11">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
