"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

interface FormCheckboxProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
}

const FormCheckbox = <T extends FieldValues>({
  label,
  name,
  setValue,
  watch,
}: FormCheckboxProps<T>) => {
  const checked = watch(name) as boolean;

  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) =>
          setValue(name, Boolean(value) as PathValue<T, Path<T>>)
        }
      />
      {label}
    </label>
  );
};

export default FormCheckbox;
