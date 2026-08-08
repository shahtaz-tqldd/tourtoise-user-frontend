import { cn } from "@/lib/utils";
import React from "react";

const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        "rounded-3xl md:rounded-3xl p-4 md:p-6 bg-white overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const PreviewCard = ({ children, className = "", ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        "md:rounded-3xl p-0 pt-5 md:p-6 md:pt-6 bg-transparent md:bg-white overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
