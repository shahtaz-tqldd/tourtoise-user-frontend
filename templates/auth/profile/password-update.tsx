import FormInput from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import React from "react";
import { useForm } from "react-hook-form";

type PasswordFieldValues = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

const PasswordUpdate = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PasswordFieldValues>();

  return (
    <div>
      <div className="max-w-md space-y-6 mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Change Password
        </h2>

        <FormInput
          label="Password"
          name="old_password"
          type="password"
          placeholder="Type your Old password"
          register={register}
          error={errors.old_password}
        />
        <FormInput
          label="Password"
          name="new_password"
          type="password"
          placeholder="Type a New password"
          register={register}
          error={errors.new_password}
        />
        <FormInput
          label="Password"
          name="confirm_password"
          type="password"
          placeholder="Confirm your password"
          register={register}
          error={errors.confirm_password}
        />

        <Button type="submit">Update Password</Button>
      </div>
    </div>
  );
};

export default PasswordUpdate;
