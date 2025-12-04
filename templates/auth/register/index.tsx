"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";

// components
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import FormInput from "@/components/form/form-input";
import FormCheckbox from "@/components/form/form-checkbox";

// icons
import { GoogleIcon } from "@/assets/icons/logo";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type RegisterFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  accept_terms: boolean;
};

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const router = useRouter();

  const onSubmit = async (data: RegisterFormValues) => {
    const { accept_terms, ...formData } = data;

    if (accept_terms) {
      console.log("term was accepted!");
    }

    const res = await api.post("/auth/register", formData);
    if (res && res.success) {
      console.log("Registration successful:", res?.data);
      router.push("/");
    } else {
      console.log("Registration successful:", res?.data);
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
            <Button type="submit" className="w-full">
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
