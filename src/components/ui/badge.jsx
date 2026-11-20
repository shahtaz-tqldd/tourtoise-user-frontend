import { cn } from "@/lib/utils";
import React from "react";

const BADGE_VARIANTS = {
  "primary-accent": "bg-accent text-accent-foreground",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-white/90 text-heading",
  neutral: "bg-surface-muted text-body",
  alert: "bg-warning-soft text-warning",
  accent: "border border-sand-100 bg-sand-50 text-sand-600",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  danger: "border border-danger-soft bg-danger-soft/50 text-danger",
};

const Badge = ({
  children,
  variant = "primary-accent",
  icon: Icon = null,
  className,
}) => {
  return (
    <span
      className={cn(
        "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-caption font-semibold capitalize backdrop-blur",
        BADGE_VARIANTS[variant],
        className,
      )}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;
