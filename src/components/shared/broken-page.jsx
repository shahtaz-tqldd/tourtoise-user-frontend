import React from "react";
import { MapPinOff, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BrokenPage = ({
  statusCode = "404",
  title = "Page not found",
  description = "The page you are looking for may have moved or is no longer available.",
  icon = MapPinOff,
  actionLabel = "Back to home",
  actionTo = "/",
  onRetry,
  retryLabel = "Try again",
  className = "",
}) => (
  <section
    className={cn(
      "relative isolate flex mt-4 min-h-[85vh] items-center justify-center overflow-hidden rounded-3xl bg-white px-5 py-14 sm:px-8",
      className,
    )}
    aria-labelledby="broken-page-title"
  >
    <div
      className="absolute -left-20 top-10 size-56 rounded-full bg-primary/5 blur-2xl"
      aria-hidden="true"
    />
    <div
      className="absolute -right-16 bottom-0 size-64 rounded-full bg-amber-100/40 blur-3xl"
      aria-hidden="true"
    />

    <div className="relative z-10 mx-auto max-w-xl text-center">
      <div className="relative mx-auto flex h-36 w-64 items-center justify-center sm:h-44 sm:w-80">
        <span
          className="select-none text-[92px] font-black leading-none tracking-tighter text-slate-100 sm:text-[120px]"
          aria-hidden="true"
        >
          {statusCode}
        </span>

        <span className="absolute flex size-16 items-center justify-center rounded-2xl border-4 border-white bg-primary text-white shadow-xl shadow-primary/20 rotate-[-8deg] sm:size-20">
          {React.createElement(icon, {
            className: "size-8 sm:size-10",
            "aria-hidden": true,
          })}
        </span>

        <span
          className="absolute bottom-3 left-5 h-px w-16 border-t-2 border-dashed border-slate-200 sm:left-7 sm:w-24"
          aria-hidden="true"
        />
        <span
          className="absolute right-5 top-5 h-px w-16 border-t-2 border-dashed border-slate-200 sm:right-7 sm:w-24"
          aria-hidden="true"
        />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
        Something went off route
      </p>
      <h1
        id="broken-page-title"
        className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
      >
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        {description}
      </p>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {actionTo && actionLabel ? (
          <Button asChild className="w-full sm:w-auto">
            <Link to={actionTo}>
              {/* <ArrowLeft aria-hidden="true" /> */}
              {actionLabel}
            </Link>
          </Button>
        ) : null}

        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onRetry}
          >
            <RefreshCw aria-hidden="true" />
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  </section>
);

export default BrokenPage;
