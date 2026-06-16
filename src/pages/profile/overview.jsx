import Card from "@/components/ui/card";
import { Compass, MapPin, Mountain, Plane } from "lucide-react";
import React from "react";
const tripPreferences = [
  { label: "Nature trails", value: "Primary", icon: Mountain },
  { label: "Local food", value: "High", icon: Compass },
  { label: "Direct flights", value: "Preferred", icon: Plane },
  { label: "Walkable stays", value: "Required", icon: MapPin },
];

const preferenceChips = [
  "Boutique stays",
  "Public transport",
  "Early starts",
  "Museums",
  "Hidden cafes",
  "Light packing",
];

const Overview = () => (
  <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {tripPreferences.map((preference) => {
          const Icon = preference.icon;

          return (
            <div
              key={preference.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="center size-10 rounded-full bg-white text-primary">
                  <Icon size={18} />
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {preference.value}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-950">
                {preference.label}
              </h3>
            </div>
          );
        })}
      </div>
    </Card>

    <Card>
      <div className="flex flex-wrap gap-2">
        {preferenceChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-primary/10 p-4">
        <p className="text-sm font-semibold text-slate-950">Budget range</p>
        <p className="mt-1 text-sm text-slate-600">
          Mid-range stays, flexible transport, and local experiences first.
        </p>
      </div>
    </Card>
  </div>
);

export default Overview;
