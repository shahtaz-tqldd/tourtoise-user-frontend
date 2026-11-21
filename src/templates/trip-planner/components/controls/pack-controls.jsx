import { Check, Cpu, FileText, HeartPulse, PartyPopper, Shirt, Sparkles, Tent } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Block } from "../planner-ui";
import { StickyAction } from "./shared";

const GROUP_ICON = { documents: FileText, clothing: Shirt, gear: Tent, health: HeartPulse, tech: Cpu };

const PackControls = ({ packing, checked, toggleChecked, completed, onComplete }) => {
  const all = packing.flatMap((g) => g.items);
  const done = all.filter((i) => checked.has(i.id)).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="px-1">
        <p className="text-body-sm font-bold text-heading">Pack your bag</p>
        <p className="text-caption text-subtle">
          {done}/{all.length} packed · <Sparkles className="inline size-3 text-brand-600" aria-hidden="true" /> added because of your plan
        </p>
      </div>

      {packing.map((group, gi) => {
        const Icon = GROUP_ICON[group.icon] || FileText;
        return (
          <Block key={group.group} className="pl-rise p-3" style={{ animationDelay: `${gi * 60}ms` }}>
            <p className="mb-1 flex items-center gap-1.5 px-1 text-caption font-bold text-heading">
              <Icon className="size-3.5 text-brand-600" aria-hidden="true" />
              {group.group}
            </p>
            <ul>
              {group.items.map((item) => {
                const on = checked.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggleChecked(item.id)}
                      className="flex w-full items-start gap-2.5 rounded-lg px-1 py-1.5 text-left transition hover:bg-surface-subtle"
                    >
                      <span
                        className={cn(
                          "center mt-0.5 size-4 shrink-0 rounded ring-1 transition",
                          on ? "bg-brand-600 text-white ring-brand-600" : "bg-surface ring-line-strong",
                        )}
                      >
                        {on && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-caption font-semibold", on ? "text-faint line-through" : "text-heading")}>
                          {item.label}
                        </span>
                        <span className="flex items-center gap-1 text-2xs text-subtle">
                          {item.smart && <Sparkles className="size-2.5 shrink-0 text-brand-600" aria-label="Added for your plan" />}
                          {item.why}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Block>
        );
      })}

      <StickyAction
        disabled={completed}
        onClick={() => {
          onComplete();
          toast.success("Trip saved", { description: "Demo: this would open the saved trip." });
        }}
      >
        <PartyPopper aria-hidden="true" />
        {completed ? "Trip saved" : "Finish & save trip"}
      </StickyAction>
    </div>
  );
};

export default PackControls;
