import React from "react";

// components
import Card from "@/components/ui/card";

// lib
// import { formatLabel } from "@/lib/utils";
import { formatMonths } from "@/lib/date-time";

// icons
import { CalendarDays, Languages, Sun, WalletCards } from "lucide-react";

const TripSnapshot = ({ destination }) => {
  const bestTime = formatMonths(destination.best_travel_months);
  const languages = destination.local_languages?.join(", ") || "N/A";
  const stays =
    destination.min_stay_days && destination.max_stay_days
      ? `${destination.min_stay_days}-${destination.max_stay_days} days`
      : destination.duration || "Flexible";
  // const budget = formatLabel(destination.budget_tier);

  const currency = destination.currency || destination.currency_code || "N/A";

  const snapshots = [
    {
      title: "Currency",
      icon: WalletCards,
      value: currency,
    },
    {
      title: "Languages",
      icon: Languages,
      value: languages,
    },
    {
      title: "Ideal stay",
      icon: CalendarDays,
      value: stays,
    },
    // {
    //   title: "Budget",
    //   icon: WalletCards,
    //   value: budget,
    // },
    {
      title: "Best Times",
      icon: Sun,
      value: bestTime,
    },
  ];

  return (
    <Card>
      <h2 className="font-bold text-slate-950">Trip Snapshot</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {snapshots.map(({ title, icon: Icon, value }) => (
          <div key={title} className="min-w-0 flex flex-col items-center">
            <div className="bg-primary/10 h-10 w-10 center rounded-full">
              {React.createElement(Icon, {
                size: 16,
                className: "shrink-0 text-primary",
              })}
            </div>
            <h4 className="truncate text-sm text-slate-500 mt-3">{title}</h4>
            <p className="mt-1 break-words text-xs font-semibold text-slate-950 text-center">
              {value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TripSnapshot;
