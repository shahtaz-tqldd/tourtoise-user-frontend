import { cn } from "@/lib/utils";
import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "rounded-3xl md:rounded-3xl p-4 md:p-6 bg-white overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const PreviewCard = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "md:rounded-3xl p-0 md:p-6 bg-transparent md:bg-white overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
