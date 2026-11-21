import { CalendarCheck, Clock3, CloudSun, Languages, MapPin, Wallet } from "lucide-react";

import { formatMonths } from "@/lib/date-time";
import { cn } from "@/lib/utils";
import { formatStayRange } from "@/templates/destinations/destination-utils";
import ChatBox from "./chat-box";

const attributesOf = (destination) => {
  const best = formatMonths(destination.best_travel_months);
  return [
    { icon: CalendarCheck, label: "Best", value: best === "N/A" ? "Oct – Dec" : best },
    { icon: Clock3, label: "Stay", value: formatStayRange(destination) || destination.duration || "3–5 days" },
    { icon: CloudSun, label: "Weather", value: destination.weather_note || "6–22°C" },
    { icon: Wallet, label: "Currency", value: destination.currency || destination.currency_code },
    { icon: Languages, label: "Language", value: destination.local_languages?.slice(0, 2).join(", ") },
  ].filter((a) => a.value);
};

/** Small, quiet progress: dots + labels. Reached steps are clickable. */
const TinyStepper = ({ stages, current, furthest, onSelect, disabled }) => (
  <nav aria-label="Planning progress">
    <ol className="flex items-center gap-1">
      {stages.map((s, i) => {
        const reachable = i <= furthest && !disabled;
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-1">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onSelect(s.key)}
              aria-current={state === "current" ? "step" : undefined}
              className="flex min-w-0 items-center gap-1.5 rounded-full py-1 pr-1 disabled:cursor-default"
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full transition-colors",
                  state === "todo" ? (i <= furthest ? "bg-brand-300" : "bg-line-strong") : "bg-brand-600",
                  state === "current" && "ring-4 ring-brand-100",
                )}
                aria-hidden="true"
              />
              <span className={cn("truncate text-2xs font-semibold", state === "current" ? "text-heading" : "text-faint")}>{s.label}</span>
            </button>
            {i < stages.length - 1 && (
              <span className={cn("h-px min-w-2 flex-1", i < current ? "bg-brand-300" : "bg-line")} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

/**
 * Right side: where the user acts. Destination brief + progress on top, the
 * current stage's controls scroll in the middle, chat pinned to the bottom.
 */
const ControlPanel = ({ destination, stages, p, children }) => {
  const address = [destination.address || destination.region || destination.city, destination.country].filter(Boolean).join(", ");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b border-line-subtle bg-surface px-4 py-3">
        <div>
          <h2 className="text-body-md font-bold text-heading">{destination.name}</h2>
          {address && (
            <p className="mt-0.5 flex items-center gap-1 text-caption text-subtle">
              <MapPin className="size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="truncate">{address}</span>
            </p>
          )}
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {attributesOf(destination).map(({ icon: Icon, label, value }) => (
              <li key={label} className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-2xs text-subtle ring-1 ring-line-subtle" title={label}>
                <Icon className="size-3 text-brand-600" aria-hidden="true" />
                <span className="font-semibold text-body">{value}</span>
              </li>
            ))}
          </ul>
        </div>
        <TinyStepper
          stages={stages}
          current={p.stageIndex}
          furthest={p.furthest}
          onSelect={p.goTo}
          disabled={Boolean(p.task)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-subtle">
        <div className="px-3 pb-3 pt-3 md:px-4 md:pb-4 md:pt-4">{children}</div>
      </div>

      <ChatBox
        stage={p.stage}
        messages={p.messages}
        chatBusy={p.chatBusy}
        onAsk={p.ask}
        disabled={Boolean(p.task || p.chatBusy)}
      />
    </div>
  );
};

export default ControlPanel;
