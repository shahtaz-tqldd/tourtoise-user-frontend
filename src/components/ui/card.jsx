import { cn } from "@/lib/utils";
import React from "react";

const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card bg-surface p-4 md:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/** Card on desktop, flat (no surface) on mobile. */
export const PreviewCard = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "overflow-hidden bg-transparent p-0 pt-5 md:rounded-card md:bg-surface md:p-6 md:pt-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
