"use client";

import { Input } from "@/components/ui/input";
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: FieldError;
}

const FormInput = <T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
}: FormInputProps<T>) => {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold opacity-60 block">{label}</label>

      <Input type={type} placeholder={placeholder} {...register(name)} className="bg-white" />

      {error && <p className="text-red-500 text-xs mt-0.5">{error.message}</p>}
    </div>
  );
};

export default FormInput;
