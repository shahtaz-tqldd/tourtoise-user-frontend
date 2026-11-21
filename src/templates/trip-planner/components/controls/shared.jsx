import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Stepper = ({ value, min, max, onChange, label, suffix }) => (
  <div className="inline-flex items-center gap-1 rounded-full bg-surface p-0.5 ring-1 ring-line">
    <button
      type="button"
      aria-label={`Fewer ${label}`}
      disabled={value <= min}
      onClick={() => onChange(value - 1)}
      className="center size-7 rounded-full text-heading transition hover:bg-accent disabled:opacity-40"
    >
      <Minus className="size-3.5" aria-hidden="true" />
    </button>
    <span className="min-w-16 text-center text-caption font-bold text-heading" aria-live="polite">
      {value} {suffix}
    </span>
    <button
      type="button"
      aria-label={`More ${label}`}
      disabled={value >= max}
      onClick={() => onChange(value + 1)}
      className="center size-7 rounded-full text-heading transition hover:bg-accent disabled:opacity-40"
    >
      <Plus className="size-3.5" aria-hidden="true" />
    </button>
  </div>
);

/** Primary action pinned to the bottom of the scrolling control area. */
export const StickyAction = ({ hint, children, ...props }) => (
  <div className="sticky bottom-0 -mx-3 -mb-3 mt-3 border-t border-line-subtle bg-surface-subtle/95 px-3 py-3 backdrop-blur md:-mx-4 md:-mb-4 md:px-4">
    {hint && <p className="mb-2 text-center text-2xs text-subtle">{hint}</p>}
    <Button size="lg" className="w-full rounded-full" {...props}>
      {children}
    </Button>
  </div>
);
