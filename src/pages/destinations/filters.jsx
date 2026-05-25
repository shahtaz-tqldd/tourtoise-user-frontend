import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import {
  Banknote,
  Building2,
  Compass,
  Footprints,
  Globe2,
  Landmark,
  Mountain,
  MapPinned,
  Palmtree,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Umbrella,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTRY_LIST } from "@/lib/countries";
import { cn } from "@/lib/utils";

const COUNTRY_CODE_BY_NAME = {
  "United States": "USA",
  France: "FRA",
  Spain: "ESP",
  Italy: "ITA",
  "United Kingdom": "GBR",
  China: "CHN",
  Japan: "JPN",
  Germany: "DEU",
  Australia: "AUS",
  Canada: "CAN",
  Mexico: "MEX",
  India: "IND",
  Thailand: "THA",
  Greece: "GRC",
  Netherlands: "NLD",
  Switzerland: "CHE",
  Austria: "AUT",
  Egypt: "EGY",
  Turkey: "TUR",
  Brazil: "BRA",
  Argentina: "ARG",
  "South Africa": "ZAF",
  Morocco: "MAR",
  Portugal: "PRT",
  Russia: "RUS",
  Norway: "NOR",
  Sweden: "SWE",
  Denmark: "DNK",
  "New Zealand": "NZL",
  Iceland: "ISL",
  Ireland: "IRL",
  "South Korea": "KOR",
  Singapore: "SGP",
  UAE: "ARE",
  Israel: "ISR",
  Peru: "PER",
  Chile: "CHL",
  "Costa Rica": "CRI",
  Indonesia: "IDN",
  Malaysia: "MYS",
  Vietnam: "VNM",
  Philippines: "PHL",
  Croatia: "HRV",
  "Czech Republic": "CZE",
};

const DESTINATION_TYPE_OPTIONS = [
  { value: "city", label: "City", icon: Building2 },
  { value: "beach", label: "Beach", icon: Umbrella },
  { value: "mountain", label: "Mountain", icon: Mountain },
  { value: "cultural", label: "Cultural", icon: Landmark },
  { value: "nature", label: "Nature", icon: Sprout },
  { value: "island", label: "Island", icon: Palmtree },
  { value: "village", label: "Village", icon: Footprints },
];

const BUDGET_TIER_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "mid", label: "Mid-range" },
  { value: "premium", label: "Premium" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "challenging", label: "Challenging" },
];

const DestinationFilter = ({
  totalDestinations,
  searchQuery,
  setSearchQuery,
  country,
  setCountry,
  destinationType,
  setDestinationType,
  budgetTier,
  setBudgetTier,
  difficulty,
  setDifficulty,
  clearFilters,
}) => {
  const countries = useMemo(
    () =>
      COUNTRY_LIST.map((country) => ({
        value: COUNTRY_CODE_BY_NAME[country.name] || country.name,
        label: country.name,
        icon: country.flag,
      })),
    [],
  );

  const selectedCountry = countries.find((option) => option.value === country);
  const selectedType = DESTINATION_TYPE_OPTIONS.find(
    (option) => option.value === destinationType,
  );
  const selectedBudget = BUDGET_TIER_OPTIONS.find(
    (option) => option.value === budgetTier,
  );
  const selectedDifficulty = DIFFICULTY_OPTIONS.find(
    (option) => option.value === difficulty,
  );
  const hasFilters = Boolean(
    searchQuery || country || destinationType || budgetTier || difficulty,
  );

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="border-b border-slate-100 bg-slate-50/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Match your trip
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {totalDestinations} matching{" "}
                {totalDestinations === 1 ? "place" : "places"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={clearFilters}
            disabled={!hasFilters}
            aria-label="Reset filters"
            className="rounded-full text-slate-500 hover:text-slate-950"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <label className="block space-y-2">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Bali, Kyoto, mountains..."
              className="h-12 rounded-full border-slate-200 bg-slate-50 pl-11 text-sm shadow-none focus-visible:ring-primary/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </label>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <Compass size={14} />
            Trip style
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DESTINATION_TYPE_OPTIONS.map((option) => {
              const isSelected = destinationType === option.value;
              const Icon = option.icon;

              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() =>
                    setDestinationType(isSelected ? "" : option.value)
                  }
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-sm font-semibold transition",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  <Icon size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <Globe2 size={14} />
            Country
          </div>
          <FloatingSelect
            label="Where to"
            placeholder="Choose a country"
            value={country}
            onValueChange={setCountry}
            triggerClassName="min-h-[56px] rounded-xl border-slate-200 bg-white shadow-none"
            contentClassName="max-h-80"
          >
            {countries.map((option) => {
              const value = typeof option === "string" ? option : option.value;
              const optionLabel =
                typeof option === "string"
                  ? option.replaceAll("_", " ")
                  : option.label;
              const optionIcon =
                typeof option === "string" ? null : option.icon;

              return (
                <SelectItem key={value} value={String(value)}>
                  {optionIcon && (
                    <span className="text-base leading-none" aria-hidden="true">
                      {optionIcon}
                    </span>
                  )}
                  <span className="capitalize">{optionLabel}</span>
                </SelectItem>
              );
            })}
          </FloatingSelect>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <Banknote size={14} />
            Budget level
          </div>
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_TIER_OPTIONS.map((option) => {
              const isSelected = budgetTier === option.value;

              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setBudgetTier(isSelected ? "" : option.value)}
                  className={cn(
                    "min-h-10 rounded-xl border px-2 text-center text-xs font-semibold transition",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <Sparkles size={14} />
            Difficulty
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((option) => {
              const isSelected = difficulty === option.value;

              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setDifficulty(isSelected ? "" : option.value)}
                  className={cn(
                    "min-h-10 rounded-xl border px-2 text-center text-xs font-semibold transition",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPinned size={16} className="text-primary" />
              Current match
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:text-green-800"
              >
                Clear all
              </button>
            )}
          </div>

          {hasFilters ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {searchQuery}
                  <X size={13} />
                </button>
              )}
              {selectedType && (
                <button
                  type="button"
                  onClick={() => setDestinationType("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize text-slate-700 ring-1 ring-slate-200"
                >
                  {selectedType.label}
                  <X size={13} />
                </button>
              )}
              {selectedCountry && (
                <button
                  type="button"
                  onClick={() => setCountry("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  <span aria-hidden="true">{selectedCountry.icon}</span>
                  {selectedCountry.label}
                  <X size={13} />
                </button>
              )}
              {selectedBudget && (
                <button
                  type="button"
                  onClick={() => setBudgetTier("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {selectedBudget.label}
                  <X size={13} />
                </button>
              )}
              {selectedDifficulty && (
                <button
                  type="button"
                  onClick={() => setDifficulty("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {selectedDifficulty.label}
                  <X size={13} />
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-5 text-slate-500">
              Start broad, then choose a trip style or country when you know
              what matters.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DestinationFilter;
