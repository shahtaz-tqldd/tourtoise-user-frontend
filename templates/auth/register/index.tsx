"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// components
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import FormInput from "@/components/form/form-input";
import FormCheckbox from "@/components/form/form-checkbox";

// icons
import { GoogleIcon } from "@/assets/icons/logo";
import { useRegistrationMutation } from "@/store/services/auth";
import { userLoggedIn } from "@/store/slices/auth-slice";

type RegisterFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  accept_terms: boolean;
};

const RegisterPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const [registration, { isLoading }] = useRegistrationMutation();

  const onSubmit = async (data: RegisterFormValues) => {
    const { accept_terms, ...formData } = data;

    if (formData.confirm_password !== formData.password) {
      toast.error("Password did not match with confirm password");
      return;
    }

    if (!accept_terms) {
      toast.warning("Please accept our terms before creating accounts");
      return;
    }

    const res = await registration(formData);
    if (res && res.data?.success) {
      dispatch(
        userLoggedIn({
          accessToken: res.data.data.access_token,
          refreshToken: res.data.data.refresh_token,
          rememberMe: false,
        })
      );
      toast.success("You are Successfully Logged In");
      router.push("/");
    } else {
      toast.error(res.error?.data.message || "Registration Failed!");
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* LEFT SIDE IMAGE */}
      <div className="h-screen">
        <Image
          src="/mountain.jpg"
          alt="Register Image"
          width={1500}
          height={1200}
          className="h-full w-full object-cover"
        />
      </div>

      {/* RIGHT SIDE */}
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

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            {/* FIRST + LAST NAME */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput<RegisterFormValues>
                label="First Name"
                name="first_name"
                placeholder="Enter your first name"
                register={register}
                error={errors.first_name}
              />

              <FormInput<RegisterFormValues>
                label="Last Name"
                name="last_name"
                placeholder="Enter your last name"
                register={register}
                error={errors.last_name}
              />
            </div>

            {/* EMAIL */}
            <FormInput<RegisterFormValues>
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              register={register}
              error={errors.email}
            />

            {/* PASSWORD */}
            <FormInput<RegisterFormValues>
              label="Password"
              name="password"
              type="password"
              placeholder="Type your password"
              register={register}
              error={errors.password}
            />

            {/* CONFIRM PASSWORD */}
            <FormInput<RegisterFormValues>
              label="Confirm Password"
              name="confirm_password"
              type="password"
              placeholder="Confirm your password"
              register={register}
              error={errors.confirm_password}
            />

            {/* TERMS CHECKBOX */}
            <FormCheckbox<RegisterFormValues>
              label="Accept terms and services"
              name="accept_terms"
              setValue={setValue}
              watch={watch}
            />

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              loadingText="Creating account..."
            >
              Create a new account
            </Button>
          </form>

          <hr className="my-6" />

          {/* GOOGLE LOGIN */}
          <Button variant="outline" className="w-full">
            <div className="flex gap-2 items-center justify-center">
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </div>
          </Button>

          <Link
            href="/login"
            className="block text-center text-primary mt-8 font-medium"
          >
            Login to your account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
