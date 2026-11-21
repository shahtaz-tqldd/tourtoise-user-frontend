import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Clock, MapPin, Sparkles, Star, Wand2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { KIND_KEYS, KIND_META } from "../../planner-engine";
import { ItemVisual, KIND_ICON } from "../planner-ui";
import { StickyAction } from "./shared";

const formatHrs = (h) => (h < 1 ? `${Math.round(h * 60)} min` : `${h} hr${h === 1 ? "" : "s"}`);

/** One recommendation. Tap the card to keep it; the star marks a must-do. */
const PickCard = ({ item, decision, onDecide, money, index }) => {
  const kept = decision === "keep" || decision === "love";
  const loved = decision === "love";

  return (
    <li className="pl-drop" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <div
        className={cn(
          "flex gap-3 rounded-control bg-surface p-2.5 ring-1 transition",
          kept ? "ring-2 ring-brand-500" : "ring-line-subtle hover:ring-line-strong",
        )}
      >
        <button
          type="button"
          aria-pressed={kept}
          onClick={() => onDecide(item.id, kept ? undefined : "keep")}
          className="flex min-w-0 flex-1 gap-3 text-left focus-visible:outline-none"
        >
          <span className="relative shrink-0">
            <ItemVisual item={item} className="size-16 rounded-lg" />
            <span
              className={cn(
                "center absolute -left-1.5 -top-1.5 size-5 rounded-full ring-2 ring-surface transition",
                kept ? "bg-brand-600 text-white" : "bg-surface-muted text-transparent",
              )}
              aria-hidden="true"
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-caption font-bold text-heading">{item.name}</span>
              <span className="shrink-0 text-2xs font-bold text-brand-700">{item.match}%</span>
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-2xs text-subtle">
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="size-3" aria-hidden="true" />
                {item.area}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Clock className="size-3" aria-hidden="true" />
                {formatHrs(item.durationHrs)}
              </span>
              <span className="font-semibold text-body">{item.cost ? `${money(item.cost)} pp` : "Free"}</span>
            </span>
            <span className="mt-1 line-clamp-1 block text-2xs text-subtle">{item.blurb}</span>
            <span className="mt-1.5 flex flex-wrap gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-3xs font-semibold text-brand-text">
                <Sparkles className="size-2.5" aria-hidden="true" />
                {item.reason}
              </span>
              {item.warning && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-1.5 py-0.5 text-3xs font-semibold text-warning">
                  <AlertTriangle className="size-2.5" aria-hidden="true" />
                  {item.warning}
                </span>
              )}
              {item.note && (
                <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-3xs font-semibold text-body">{item.note}</span>
              )}
            </span>
          </span>
        </button>
        <button
          type="button"
          aria-pressed={loved}
          aria-label={loved ? "Remove must-do" : "Mark as must-do"}
          title="Must-do — gets the best slot"
          onClick={() => onDecide(item.id, loved ? "keep" : "love")}
          className={cn(
            "center size-8 shrink-0 self-center rounded-full ring-1 transition",
            loved ? "bg-sand-100 ring-sand-300" : "ring-line hover:ring-sand-300",
          )}
        >
          <Star className={cn("size-4", loved ? "fill-sand-400 text-sand-500" : "text-faint")} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
};

/**
 * Spots, activities and food on one scrolling list. The tabs are jump links
 * that also show which section you're in and how many you've kept.
 */
const DiscoverControls = ({ ranked, decisions, decide, autoPick, picks, money, onNext }) => {
  const [inView, setInView] = useState("spots");
  const refs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setInView(visible.target.dataset.kind);
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const jump = (k) => refs.current[k]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const kept = (k) => ranked[k].filter((i) => ["keep", "love"].includes(decisions[i.id])).length;

  return (
    <div className="flex flex-col">
      <div className="px-1 pb-2">
        <p className="text-body-sm font-bold text-heading">Pick what excites you</p>
        <p className="text-caption text-subtle">Ranked for you. Tap to keep, ★ for must-dos.</p>
      </div>

      <div role="tablist" className="sticky top-0 z-10 -mx-3 flex gap-1.5 bg-surface-subtle/95 px-3 py-2 backdrop-blur md:-mx-4 md:px-4">
        {KIND_KEYS.map((k) => {
          const Icon = KIND_ICON[k];
          const active = inView === k;
          return (
            <button
              key={k}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => jump(k)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-2xs font-semibold ring-1 transition",
                active ? "bg-accent text-brand-text ring-brand-300" : "bg-surface text-subtle ring-line-subtle hover:text-heading",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {KIND_META[k].label}
              <span key={kept(k)} className={cn("pl-pop rounded-full px-1.5 text-3xs font-bold", kept(k) ? "bg-brand-600 text-white" : "bg-surface-muted text-faint")}>
                {kept(k)}
              </span>
            </button>
          );
        })}
      </div>

      {KIND_KEYS.map((k) => (
        <section
          key={k}
          data-kind={k}
          ref={(el) => {
            refs.current[k] = el;
          }}
          className="scroll-mt-12 pt-3"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-caption font-bold text-heading">
              {KIND_META[k].label} <span className="font-medium text-faint">· {ranked[k].length}</span>
            </h3>
            <button
              type="button"
              onClick={() => autoPick(k)}
              className="inline-flex items-center gap-1 text-2xs font-semibold text-brand-text hover:underline"
            >
              <Wand2 className="size-3" aria-hidden="true" />
              Pick for me
            </button>
          </div>
          <ul className="space-y-2">
            {ranked[k].map((item, i) => (
              <PickCard key={item.id} item={item} index={i} decision={decisions[item.id]} onDecide={decide} money={money} />
            ))}
          </ul>
        </section>
      ))}

      <StickyAction
        disabled={!picks.length}
        onClick={onNext}
        hint={picks.length ? `${picks.length} picks · they're collecting on your plan` : "Keep at least one to continue"}
      >
        <Sparkles aria-hidden="true" />
        Build my days
      </StickyAction>
    </div>
  );
};

export default DiscoverControls;
