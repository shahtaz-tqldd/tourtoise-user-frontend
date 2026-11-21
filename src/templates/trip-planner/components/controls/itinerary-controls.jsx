import { ArrowRightLeft, MoreHorizontal, Star, Trash2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PACE_OPTIONS } from "../../mock/mock-data";
import { formatDay } from "../../planner-engine";
import { Block, FieldLabel, ItemVisual, OptionGrid } from "../planner-ui";
import { StickyAction, Stepper } from "./shared";

const ItemMenu = ({ item, days, currentDay, onMove, onRemove }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label={`Options for ${item.name}`}>
        <MoreHorizontal aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel className="text-2xs text-subtle">Move to</DropdownMenuLabel>
      {days
        .filter((d) => d.index !== currentDay)
        .map((d) => (
          <DropdownMenuItem key={d.index} onSelect={() => onMove(item.id, d.index)}>
            <ArrowRightLeft aria-hidden="true" />
            Day {d.index + 1} · {formatDay(d.date, { weekday: "short" })}
          </DropdownMenuItem>
        ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-danger" onSelect={() => onRemove(item.id)}>
        <Trash2 aria-hidden="true" />
        Remove from trip
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ItemRow = ({ item, days, day, onMove, onRemove }) => (
  <li className="flex items-center gap-2 py-1">
    <ItemVisual item={item} className="size-7 shrink-0 rounded-md" />
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1 truncate text-caption font-semibold text-heading">
        {item.love && <Star className="size-3 shrink-0 fill-sand-400 text-sand-400" aria-label="Must-do" />}
        <span className="truncate">{item.name}</span>
      </p>
      {item.time && <p className="text-2xs text-faint">{item.time}</p>}
    </div>
    <ItemMenu item={item} days={days} currentDay={day} onMove={onMove} onRemove={onRemove} />
  </li>
);

const ItineraryControls = ({ plan, trip, replan, moveItem, removeItem, onNext }) => {
  const { days, unplaced } = plan;

  return (
    <div className="flex flex-col gap-3">
      <div className="px-1">
        <p className="text-body-sm font-bold text-heading">Shape your days</p>
        <p className="text-caption text-subtle">Changes re-flow the plan on the left instantly.</p>
      </div>

      <Block className="pl-rise">
        <FieldLabel>Rhythm</FieldLabel>
        <OptionGrid options={PACE_OPTIONS} value={trip.pace} onChange={(v) => replan({ pace: v })} />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-caption font-semibold text-body">Trip length</p>
          <Stepper
            value={trip.nights + 1}
            min={2}
            max={9}
            label="days"
            suffix="days"
            onChange={(v) => replan({ nights: v - 1 })}
          />
        </div>
      </Block>

      {unplaced.length > 0 && (
        <Block className="pl-rise bg-warning-soft/60 ring-sand-200">
          <p className="text-caption font-bold text-heading">Didn't fit ({unplaced.length})</p>
          <p className="text-2xs text-subtle">Add a day, move them in, or let them go.</p>
          <ul className="mt-2">
            {unplaced.map((item) => (
              <ItemRow key={item.id} item={item} days={days} day={-1} onMove={moveItem} onRemove={removeItem} />
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-2 w-full rounded-full bg-surface" onClick={() => replan({ nights: trip.nights + 1 })}>
            Add a day
          </Button>
        </Block>
      )}

      <Block className="pl-rise" style={{ animationDelay: "60ms" }}>
        <FieldLabel hint="Move or remove anything">Edit days</FieldLabel>
        <div className="divide-y divide-line-subtle">
          {days.map((day) => (
            <div key={day.index} className="py-2 first:pt-0 last:pb-0">
              <p className="text-2xs font-bold uppercase tracking-wide text-brand-text">
                Day {day.index + 1} · {formatDay(day.date, { weekday: "short", day: "numeric" })}
              </p>
              {day.items.length ? (
                <ul>
                  {day.items.map((item) => (
                    <ItemRow key={item.id} item={item} days={days} day={day.index} onMove={moveItem} onRemove={removeItem} />
                  ))}
                </ul>
              ) : (
                <p className="py-1 text-2xs italic text-faint">Free day</p>
              )}
            </div>
          ))}
        </div>
      </Block>

      <StickyAction onClick={onNext}>
        <Wallet aria-hidden="true" />
        Price my trip
      </StickyAction>
    </div>
  );
};

export default ItineraryControls;
