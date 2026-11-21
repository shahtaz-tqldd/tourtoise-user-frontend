import { Activity, Landmark, Utensils } from "lucide-react";

import { cn } from "@/lib/utils";

export const KIND_ICON = { spots: Landmark, activities: Activity, food: Utensils };

/* Type scale for the planner — bold, not big:
   title   → text-body-md font-bold   (section headings)
   label   → text-caption font-semibold text-subtle
   body    → text-body-sm
   meta    → text-2xs / text-caption text-faint */

export const SectionTitle = ({ children, meta, icon: Icon, className }) => (
  <div className={cn("flex items-center justify-between gap-2", className)}>
    <h2 className="flex items-center gap-2 text-body-md font-bold text-heading">
      {Icon && <Icon className="size-4 text-brand-600" aria-hidden="true" />}
      {children}
    </h2>
    {meta && <span className="shrink-0 text-caption font-medium text-subtle">{meta}</span>}
  </div>
);

export const FieldLabel = ({ children, hint }) => (
  <div className="mb-2 flex items-baseline justify-between gap-2">
    <p className="text-caption font-semibold text-heading">{children}</p>
    {hint && <p className="truncate text-2xs text-faint">{hint}</p>}
  </div>
);

/** Photo when we have one, otherwise a soft branded gradient with the kind icon. */
export const ItemVisual = ({ item, className, iconClassName }) => {
  const Icon = KIND_ICON[item.kind] || Landmark;

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br", item.hue, className)}>
      {item.image ? (
        <img src={item.image} alt="" className="absolute inset-0 size-full object-cover" decoding="async" />
      ) : (
        <Icon
          className={cn("absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 text-white/85", iconClassName)}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/** The turtle avatar with an optional "thinking" halo. */
export const AgentAvatar = ({ size = "md", thinking = false, className }) => {
  const dims = { xs: "size-5", sm: "size-7", md: "size-9" }[size];

  return (
    <span className={cn("relative inline-flex shrink-0", dims, className)}>
      {thinking && (
        <>
          <span className="pl-ring absolute inset-0 rounded-full bg-brand-400/40" aria-hidden="true" />
          <span className="pl-ring absolute inset-0 rounded-full bg-brand-400/30" style={{ animationDelay: "1.3s" }} aria-hidden="true" />
        </>
      )}
      <span className="relative center size-full rounded-full bg-surface ring-1 ring-brand-100">
        <img src="/logo.png" alt="" className="size-[72%] object-contain" />
      </span>
    </span>
  );
};

export const TypingDots = ({ className }) => (
  <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span key={i} className="pl-dot size-1 rounded-full bg-current" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </span>
);

/** Pill toggle used across the control panel. */
export const ChoiceChip = ({ active, onClick, children, className, ...props }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-semibold ring-1 transition",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "bg-accent text-brand-text ring-brand-500" : "bg-surface text-body ring-line hover:ring-brand-300",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

/** Segmented option cards (pace, stay, trip type). */
export const OptionGrid = ({ options, value, onChange, cols = 3, render }) => (
  <div className={cn("grid gap-2", cols === 4 ? "grid-cols-2 sm:grid-cols-4" : cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
    {options.map((o) => {
      const active = value === o.value;
      return (
        <button
          key={o.value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-control p-2.5 text-left ring-1 transition",
            active ? "bg-accent ring-2 ring-brand-500" : "bg-surface ring-line hover:ring-brand-300",
          )}
        >
          {render ? (
            render(o, active)
          ) : (
            <>
              <p className="text-caption font-bold text-heading">{o.label}</p>
              {o.hint && <p className="mt-0.5 text-2xs leading-snug text-subtle">{o.hint}</p>}
            </>
          )}
        </button>
      );
    })}
  </div>
);

/** A quiet card block inside the control panel. */
export const Block = ({ className, children, ...props }) => (
  <section className={cn("rounded-card bg-surface p-4 ring-1 ring-line-subtle", className)} {...props}>
    {children}
  </section>
);
