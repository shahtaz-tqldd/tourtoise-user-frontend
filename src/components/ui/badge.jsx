import { cn } from "@/lib/utils";
import React from "react";

const Badge = ({ children, variant = "primary-accent", icon: Icon = null }) => {
  const colors = {
    "primary-accent": "bg-primary/10 text-primary",
    primary: "bg-primary text-white",
    secondary: "bg-white/90 text-slate-900",
    alert: "bg-orange-100 text-orange-600",
    accent: "bg-amber-100/60 text-amber-600 border border-amber-100",
    danger: "bg-red-100/50 text-red-600 border border-red-100",
  };
  return (
    <span
      className={cn(
        "w-fit rounded-full px-2.5 py-1.5 text-xs font-semibold backdrop-blur capitalize flex items-center gap-1.5",
        colors[variant],
      )}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default Badge;
