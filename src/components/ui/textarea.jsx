import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function FloatingTextarea({
  label,
  error,
  className,
  textareaClassName,
  placeholder = " ",
  rows = 4,
  value,
  onChange,
  onBlur,
  name,
  ...props
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={cn(
            `peer min-h-32 w-full rounded-xl border bg-white px-4 pt-6 pb-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-transparent focus:placeholder:text-slate-400
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
            }`,
            textareaClassName,
          )}
          {...props}
        />

        <label
          htmlFor={name}
          className="
            absolute top-0 left-4 z-10 origin-[0] -translate-y-1/2 scale-90 bg-white px-1 py-1 text-sm text-slate-500 transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-6 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
            peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-90 peer-focus:text-primary
          "
        >
          {label}
        </label>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export { Textarea, FloatingTextarea };
