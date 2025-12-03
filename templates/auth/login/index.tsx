"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";

// components
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

// icons
import { GoogleIcon } from "@/assets/icons/logo";
import FormInput from "@/components/form/form-input";
import FormCheckbox from "@/components/form/form-checkbox";

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = (data: LoginFormValues) => {
    console.log("FORM DATA:", data);
    // TODO: send to API
  };

  return (
    <div className="grid grid-cols-2 min-h-screen">
      {/* Left Side Image */}
      <div>
        <Image
          src="/login.jpg"
          alt="Login Image"
          width={1500}
          height={1200}
          className="h-full w-full object-cover object-right"
        />
      </div>

      {/* Right Side Form */}
      <div className="center">
        <div className="max-w-sm w-full">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Tourtoise Logo"
              width={80}
              height={80}
              className="mb-2 h-14 w-14 object-contain"
            />
          </Link>

          <Typography as="h2">Get started with tourtoise</Typography>
          <Typography as="p" size="sm">
            Login to your account
          </Typography>

          {/* FORM */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
            <FormInput
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              register={register}
              error={errors.email}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="Type your password"
              register={register}
              error={errors.password}
            />

            <div className="flex items-center justify-between my-4">
              <FormCheckbox<LoginFormValues>
                label="Remember me"
                name="remember"
                setValue={setValue}
                watch={watch}
              />

              {/* Your existing link */}
              <Link
                href="/forgot-password"
                className="text-sm text-emerald-700"
              >
                Forgot Password
              </Link>
            </div>

            <Button type="submit" className="w-full mt-4">
              Login
            </Button>
          </form>

          <hr className="my-6" />

          {/* Google Login */}
          <Button variant="outline" className="w-full">
            <div className="flex items-center justify-center gap-2">
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </div>
          </Button>

          {/* Register Link */}
          <Link
            href="/register"
            className="block text-center text-emerald-800 mt-12 text-sm"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
