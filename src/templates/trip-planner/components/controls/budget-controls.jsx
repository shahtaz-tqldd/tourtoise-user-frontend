import { BadgeCheck, Backpack, Scissors, Wand2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FX, STAY_TIERS } from "../../mock/mock-data";
import { Block, FieldLabel, ItemVisual, OptionGrid } from "../planner-ui";
import { StickyAction } from "./shared";

const BudgetControls = ({ budget, plan, trip, updateTrip, money, removeItem, onAsk, chatBusy, onNext }) => {
  const target = trip.budgetPerPerson;
  const over = budget.perPerson - target;
  const fits = over <= 0;
  const paid = plan.days
    .flatMap((d) => d.items)
    .filter((i) => i.kind === "activities" && i.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  return (
    <div className="flex flex-col gap-3">
      <div className="px-1">
        <p className="text-body-sm font-bold text-heading">Make it fit</p>
        <p className="text-caption text-subtle">Move the target or trim extras — the breakdown updates on the left.</p>
      </div>

      <Block className="pl-rise">
        <div className="flex items-center justify-between">
          <FieldLabel>Target per person</FieldLabel>
          <span
            key={String(fits)}
            className={cn(
              "pl-pop mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold",
              fits ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
            )}
          >
            {fits ? <BadgeCheck className="size-3" aria-hidden="true" /> : <Scissors className="size-3" aria-hidden="true" />}
            {fits ? "Fits" : `${money(over)} over`}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-h4 font-bold text-heading">{money(target)}</p>
          <p className="text-caption text-subtle">Plan: {money(budget.perPerson)}</p>
        </div>
        <input
          type="range"
          min={100}
          max={1500}
          step={25}
          value={Math.min(target, 1500)}
          onChange={(e) => updateTrip({ budgetPerPerson: Number(e.target.value) })}
          aria-label="Target budget per person"
          className="mt-1 w-full accent-brand-600"
        />
        {!fits && (
          <Button
            variant="soft"
            size="sm"
            className="mt-2 w-full rounded-full"
            disabled={Boolean(chatBusy)}
            onClick={() => onAsk(`Make it cheaper, under ${Math.round(target * (FX[trip.currency] || 1))}`)}
          >
            <Wand2 aria-hidden="true" />
            Let Turtle trim it to fit
          </Button>
        )}
      </Block>

      <Block className="pl-rise" style={{ animationDelay: "60ms" }}>
        <FieldLabel>Where you'll sleep</FieldLabel>
        <OptionGrid
          options={STAY_TIERS}
          value={trip.stay}
          onChange={(v) => updateTrip({ stay: v })}
          render={(o) => (
            <>
              <p className="text-caption font-bold text-heading">{o.label}</p>
              <p className="text-2xs text-subtle">{money(o.perRoomNight)}/night</p>
            </>
          )}
        />
      </Block>

      <Block className="pl-rise" style={{ animationDelay: "120ms" }}>
        <FieldLabel hint="Biggest first">Paid experiences</FieldLabel>
        {paid.length ? (
          <ul className="divide-y divide-line-subtle">
            {paid.map((item) => (
              <li key={item.id} className="flex items-center gap-2 py-1.5">
                <ItemVisual item={item} className="size-7 shrink-0 rounded-md" />
                <p className="min-w-0 flex-1 truncate text-caption font-semibold text-heading">{item.name}</p>
                <span className="text-caption font-bold text-heading">{money(item.cost * trip.travelers)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Drop ${item.name}`}
                  title="Drop from plan"
                  className="center size-6 rounded-full text-faint ring-1 ring-line hover:bg-danger-soft hover:text-danger"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption italic text-faint">No paid activities — this trip runs on free views.</p>
        )}
      </Block>

      <StickyAction onClick={onNext}>
        <Backpack aria-hidden="true" />
        Lock plan & pack my bag
      </StickyAction>
    </div>
  );
};

export default BudgetControls;
