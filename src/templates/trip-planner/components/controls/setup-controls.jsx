import { useState } from "react";
import { Pencil, Sparkles, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { DIETARY_OPTIONS, INTEREST_OPTIONS, PACE_OPTIONS, STAY_TIERS, TRIP_TYPES } from "../../mock/mock-data";
import { fromInputDate, toInputDate } from "../../planner-engine";
import { Block, ChoiceChip, FieldLabel, OptionGrid } from "../planner-ui";
import { StickyAction, Stepper } from "./shared";

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

/** Pace / interests / diet — from the profile, adjustable for this trip only. */
const TravelStyle = ({ trip, updateTrip, profile }) => {
  const firstTime = !profile.travel_pace && !profile.travel_interests?.length;
  const [editing, setEditing] = useState(firstTime);
  const [saveToProfile, setSaveToProfile] = useState(true);

  const changed =
    !firstTime &&
    (trip.pace !== (profile.travel_pace || "moderate") ||
      [...trip.interests].sort().join() !== [...(profile.travel_interests || [])].sort().join() ||
      [...trip.dietary].sort().join() !== [...(profile.dietary_preferences || [])].sort().join());

  return (
    <Block>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-body-sm font-bold text-heading">{firstTime ? "Tell Turtle what you love" : "Your travel style"}</p>
          <p className="text-2xs text-subtle">
            {firstTime ? "First trip? Pick a few — every recommendation uses them." : changed ? "Changed for this trip only" : "From your profile"}
          </p>
        </div>
        {!firstTime && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-semibold text-brand-text ring-1 ring-brand-200 hover:bg-accent"
          >
            <Pencil className="size-3" aria-hidden="true" />
            {editing ? "Done" : "Adjust for this trip"}
          </button>
        )}
      </div>

      {!editing ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-accent px-2.5 py-1 text-2xs font-semibold text-brand-text">
            {PACE_OPTIONS.find((o) => o.value === trip.pace)?.label} pace
          </span>
          {trip.interests.map((i) => (
            <span key={i} className="rounded-full bg-surface-subtle px-2.5 py-1 text-2xs font-semibold text-body ring-1 ring-line-subtle">
              {i}
            </span>
          ))}
          {trip.dietary
            .filter((d) => d !== "No restriction")
            .map((d) => (
              <span key={d} className="rounded-full bg-sand-100 px-2.5 py-1 text-2xs font-semibold text-sand-700">
                {d}
              </span>
            ))}
        </div>
      ) : (
        <div className="pl-rise mt-4 space-y-4">
          <div>
            <FieldLabel>Pace</FieldLabel>
            <OptionGrid options={PACE_OPTIONS} value={trip.pace} onChange={(v) => updateTrip({ pace: v })} />
          </div>
          <div>
            <FieldLabel>Interests</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((i) => (
                <ChoiceChip key={i} active={trip.interests.includes(i)} onClick={() => updateTrip({ interests: toggle(trip.interests, i) })}>
                  {i}
                </ChoiceChip>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Food needs</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((d) => (
                <ChoiceChip key={d} active={trip.dietary.includes(d)} onClick={() => updateTrip({ dietary: toggle(trip.dietary, d) })}>
                  {d}
                </ChoiceChip>
              ))}
            </div>
          </div>
          {firstTime && (
            <label className="flex items-center gap-2 text-caption text-body">
              <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} className="size-4 accent-brand-600" />
              Save to my profile for next time
            </label>
          )}
        </div>
      )}
    </Block>
  );
};

const SetupControls = ({ destination, trip, updateTrip, profile, money, onNext }) => {
  const best = (destination.best_travel_months || [9, 10, 11, 2, 3]).map(Number);
  const inSeason = best.includes(trip.startDate.getMonth());

  return (
    <div className="flex flex-col gap-3">
      <div className="px-1">
        <p className="text-body-sm font-bold text-heading">Let's set up your trip</p>
        <p className="text-caption text-subtle">I already know how you travel — just confirm the basics.</p>
      </div>

      <Block className="pl-rise">
        <FieldLabel>Who's coming?</FieldLabel>
        <OptionGrid
          options={TRIP_TYPES}
          cols={4}
          value={trip.type}
          onChange={(v) => updateTrip({ type: v, travelers: TRIP_TYPES.find((t) => t.value === v).travelers })}
          render={(o) => (
            <>
              <span className="text-lg" aria-hidden="true">{o.emoji}</span>
              <p className="text-caption font-bold text-heading">{o.label}</p>
            </>
          )}
        />
        {(trip.type === "friends" || trip.type === "family") && (
          <div className="pl-rise mt-3 flex items-center justify-between">
            <p className="text-caption font-semibold text-body">Travellers</p>
            <Stepper value={trip.travelers} min={2} max={12} label="travellers" suffix="people" onChange={(v) => updateTrip({ travelers: v })} />
          </div>
        )}
      </Block>

      <Block className="pl-rise" style={{ animationDelay: "60ms" }}>
        <FieldLabel>When?</FieldLabel>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={toInputDate(trip.startDate)}
            min={toInputDate(new Date())}
            onChange={(e) => e.target.value && updateTrip({ startDate: fromInputDate(e.target.value) })}
            aria-label="Start date"
            className="h-9 rounded-control border border-line bg-surface px-3 text-caption font-semibold text-heading outline-none focus:ring-2 focus:ring-ring"
          />
          <Stepper value={trip.nights} min={1} max={10} label="nights" suffix={trip.nights === 1 ? "night" : "nights"} onChange={(v) => updateTrip({ nights: v })} />
        </div>
        <p
          key={String(inSeason)}
          className={cn(
            "pl-drop mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold",
            inSeason ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
          )}
        >
          <Sun className="size-3" aria-hidden="true" />
          {inSeason ? "Peak season — clear mountain views" : "Off-season — fewer crowds, cloudier peaks"}
        </p>
      </Block>

      <Block className="pl-rise" style={{ animationDelay: "120ms" }}>
        <FieldLabel hint={`≈ ${money(trip.budgetPerPerson / (trip.nights + 1))} / day`}>Budget per person</FieldLabel>
        <p className="text-h4 font-bold text-heading">{money(trip.budgetPerPerson)}</p>
        <input
          type="range"
          min={100}
          max={1500}
          step={25}
          value={Math.min(trip.budgetPerPerson, 1500)}
          onChange={(e) => updateTrip({ budgetPerPerson: Number(e.target.value) })}
          aria-label="Budget per person"
          className="mt-1 w-full accent-brand-600"
        />
        <div className="mt-3">
          <FieldLabel>Stay</FieldLabel>
          <OptionGrid options={STAY_TIERS} value={trip.stay} onChange={(v) => updateTrip({ stay: v })} />
        </div>
      </Block>

      <div className="pl-rise" style={{ animationDelay: "180ms" }}>
        <TravelStyle trip={trip} updateTrip={updateTrip} profile={profile} />
      </div>

      <StickyAction onClick={onNext}>
        <Sparkles aria-hidden="true" />
        Find my picks
      </StickyAction>
    </div>
  );
};

export default SetupControls;
