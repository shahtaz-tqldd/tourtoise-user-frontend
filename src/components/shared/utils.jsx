import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export const DetailPill = ({ children, className }) => {
  if (!children) return null;

  return (
    <span
      className={cn(
        "rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-800 shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
};

export const AuthorMessage = ({
  message,
  title = null,
  component = null,
  className = "",
  author = "turtle",
}) => {
  return (
    <div className={cn("flex gap-3 w-fit md:max-w-[88%]", className)}>
      <div className="mt-1 flex h-8 w-8 shrink-0">
        <img src="/logo.png" className="h-full object-contain" />
      </div>
      <div className="bg-primary/10 rounded-xl px-4 py-3 rounded-tl-md">
        <span className="text-primary font-semibold text-xs uppercase tracking-wider">
          {author}
        </span>
        {title && (
          <h3 className="text-sm font-semibold text-slate-950 mb-1">{title}</h3>
        )}
        <p className="text-sm md:leading-6 text-slate-700">{message}</p>
        {component && component}
      </div>
    </div>
  );
};

export const NotificationCard = ({
  message,
  title = null,
  icon = Sparkles,
}) => {
  const Icon = icon;

  return (
    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="center mt-0.5 size-8 shrink-0 rounded-full bg-white text-primary">
          <Icon size={17} />
        </div>

        <div>
          {title && (
            <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          )}
          <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const Logo = ({ className = "flex" }) => {
  return (
    <Link
      to="/"
      className={cn("items-center gap-2", className)}
      aria-label="tourtoise"
    >
      <img src="/logo.png" className="h-7 md:h-8" alt="" />
      <span className="min-w-0">
        <span className="block md:pt-1 truncate text-xl md:text-2xl logo-font font-bold text-primary">
          tourtoise
        </span>
      </span>
    </Link>
  );
};

export const PageTitle = ({
  title,
  text,
  variant = "dark",
  className = "",
}) => {
  return (
    <div className={className}>
      <h1
        className={cn(
          "text-xl md:text-2xl font-bold",
          variant === "dark" ? "text-slate-800" : "text-white",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "mt-1.5 max-w-xl text-sm md:text-base md:leading-7",
          variant === "dark" ? "text-slate-600" : "text-slate-200",
        )}
      >
        {text}
      </p>
    </div>
  );
};

export const SectionHeader = ({
  title,
  description,
  icon = null,
  className = "",
}) => (
  <div className={cn("flex items-start justify-between gap-4", className)}>
    <div className="flex gap-3">
      {icon && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {React.createElement(icon, { size: 18 })}
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>
    </div>
  </div>
);
