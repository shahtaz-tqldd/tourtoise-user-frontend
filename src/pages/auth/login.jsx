import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";

import { useLoginMutation } from "@/features/auth/authApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const LoginPage = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState("");
  const [errorAnimationKey, setErrorAnimationKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const successMessage = location.state?.message;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle successful authentication
  const handleAuthSuccess = (accessToken, refreshToken, rememberMe) => {
    dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
    navigate("/", { replace: true });
  };

  const onSubmit = async (data) => {
    try {
      const res = await login({
        email: data.email,
        password: data.password,
        remember_me: data.rememberMe,
      }).unwrap();

      if (res.success && res.data) {
        handleAuthSuccess(
          res.data.access_token,
          res.data.refresh_token,
          data.rememberMe,
        );
        setError("");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(getApiErrorMessage(error));
      setErrorAnimationKey((current) => current + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-6 sm:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-12">
            <img src="/logo.png" className="h-12 object-contain mb-2" />
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Let's get started
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your tourtoise account.
            </p>
          </div>
          {error && (
            <div
              key={errorAnimationKey}
              className="error-bounce mb-6 -mt-6 rounded-lg border border-red-200 bg-red-100 p-2 text-center text-xs"
            >
              <span className="text-red-500">{error}</span>
            </div>
          )}

          {!error && successMessage && (
            <div className="mb-6 -mt-6 rounded-lg border border-green-200 bg-green-100 p-2 text-center text-xs">
              <span className="text-green-700">{successMessage}</span>
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

            <div className="flex items-center justify-between gap-4">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                    <label
                      htmlFor="rememberMe"
                      className="cursor-pointer text-sm text-slate-600"
                    >
                      Remember me
                    </label>
                  </div>
                )}
              />
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
