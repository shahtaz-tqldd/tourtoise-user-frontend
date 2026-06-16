import React from "react";
import {
  Bell,
  BellRing,
  Bookmark,
  Clock3,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const alertItems = [
  {
    id: "nearby",
    title: "3 new strays nearby",
    description: "Within your selected discovery area",
    icon: MapPin,
    tone: "primary",
  },
  {
    id: "urgent",
    title: "Urgent rescue alert",
    description: "A rescuer marked a case as time-sensitive",
    icon: ShieldAlert,
    tone: "amber",
  },
  {
    id: "shortlist",
    title: "Shortlist activity",
    description: "One saved stray has a new update",
    icon: Bookmark,
    tone: "soft",
  },
];

const AlertMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="relative center size-9 md:size-11 rounded-full border border-primary/10 bg-[#f8faf8] text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        aria-label="Open rescue alerts"
      >
        <Bell className="size-4 md:size-5" />
        <span className="absolute right-1.5 md:right-2.5 top-1.5 md:top-2.5 size-2.5 rounded-full border-2 border-white bg-[#ffcf36]" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-[min(calc(100vw-2rem),24rem)] rounded-[24px] border-primary/10 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
    >
      <DropdownMenuLabel className="flex items-center gap-3 rounded-2xl bg-[#f7faf8] p-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-white">
          <BellRing className="size-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-900">
            Rescue alerts
          </span>
          <span className="mt-0.5 block text-xs font-normal text-slate-500">
            Top updates from nearby cases
          </span>
        </span>
      </DropdownMenuLabel>
      <div className="py-1">
        {alertItems.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.id}
              className="items-start gap-3 rounded-2xl px-3 py-3 focus:bg-primary/5"
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                  item.tone === "primary" && "bg-primary/8 text-primary",
                  item.tone === "amber" && "bg-[#fff4c7] text-[#8a5b00]",
                  item.tone === "soft" && "bg-[#eef8f2] text-primary",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {item.description}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-primary focus:bg-primary/5 focus:text-primary">
        <Clock3 className="size-4" />
        View all alerts
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default AlertMenu;
