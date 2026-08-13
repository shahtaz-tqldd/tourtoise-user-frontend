import React, { useId } from "react";
import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EmptyPage = ({
  title = "Nothing here yet",
  description,
  eyebrow = "Your next adventure starts here",
  icon = Compass,
  actionLabel,
  actionTo,
  onAction,
  size = "md",
  className = "",
}) => {
  const titleId = useId();

  return (
    <section
      className={cn(
        "relative isolate h-full center overflow-hidden rounded-3xl bg-white py-8 smpy-12 px-5 sm:px-8",
        className,
      )}
      aria-labelledby={titleId}
    >
      <div
        className="absolute -left-20 top-8 size-56 rounded-full bg-primary/5 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-16 bottom-0 size-64 rounded-full bg-amber-100/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <div
          className="relative mx-auto flex h-28 w-56 items-center justify-center sm:h-36 sm:w-72"
          aria-hidden="true"
        >
          <span className="absolute left-3 top-1/2 size-3 -translate-y-1/2 rounded-full bg-primary/20 ring-4 ring-primary/5 sm:left-4" />
          <span className="absolute right-3 top-1/2 size-3 -translate-y-1/2 rounded-full bg-amber-300/70 ring-4 ring-amber-100/70 sm:right-4" />
          <span className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-200 sm:left-8 sm:right-8" />

          <span className="relative flex size-16 -rotate-6 items-center justify-center rounded-2xl border-4 border-white bg-primary text-white shadow-xl shadow-primary/20 sm:size-20">
            {React.createElement(icon, {
              className: "size-8 sm:size-10",
            })}
          </span>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <h2
          id={titleId}
          className={cn(
            "mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mx-auto mt-3 text-slate-500 text-sm",
              size === "sm"
                ? "md:text-md max-w-[260px]"
                : "md:text-base max-w-md",
            )}
          >
            {description}
          </p>
        ) : null}

        {actionLabel && (actionTo || onAction) ? (
          <div className="mt-8 flex justify-center">
            {actionTo ? (
              <Button asChild className="w-full sm:w-auto">
                <Link to={actionTo}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default EmptyPage;
