import { CalendarDays, Languages, Sun, WalletCards } from "lucide-react";

import { formatMonths } from "@/lib/date-time";
import { cn } from "@/lib/utils";
import { formatStayRange, isBestTimeNow } from "../../destination-utils";

/** The four things people check first, in one scannable strip. */
const QuickFacts = ({ destination, className }) => {
  const inSeason = isBestTimeNow(destination);
  const bestTime = formatMonths(destination.best_travel_months);

  const facts = [
    {
      label: "Best time",
      icon: Sun,
      value: bestTime === "N/A" ? "Any time" : bestTime,
      note: inSeason ? "In season now" : null,
    },
    {
      label: "Ideal stay",
      icon: CalendarDays,
      value: formatStayRange(destination) || destination.duration || "Flexible",
    },
    {
      label: "Currency",
      icon: WalletCards,
      value: destination.currency || destination.currency_code,
    },
    {
      label: "Languages",
      icon: Languages,
      value: destination.local_languages?.join(", "),
    },
  ].filter((fact) => fact.value);

  if (!facts.length) return null;

  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line-subtle ring-1 ring-line-subtle sm:grid-cols-2",
        className,
      )}
    >
      {facts.map(({ label, icon: Icon, value, note }) => (
        <div key={label} className="flex min-w-0 gap-3 bg-surface p-4">
          <span className="center size-9 shrink-0 rounded-full bg-accent text-brand-text">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 w-full">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-caption text-subtle">{label}</dt>
              {note && (
                <dd className="inline-flex items-center gap-1.5 text-caption font-semibold text-brand-text">
                  <span
                    className="size-1.5 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {note}
                </dd>
              )}
            </div>
            <dd className="mt-0.5 text-body-sm font-semibold text-heading">
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
};

export default QuickFacts;
