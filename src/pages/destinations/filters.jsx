import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { COUNTRY_LIST } from "@/lib/countries";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Building2,
  Compass,
  Footprints,
  Globe2,
  Landmark,
  Mountain,
  Palmtree,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Umbrella,
  X,
} from "lucide-react";

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

const filterCount = (...groups) =>
  groups.reduce((count, group) => count + group.length, 0);

const toggleValue = (values, value) =>
  values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [...values, value];

const OptionGroup = ({ title, icon, options, selectedValues, onToggle }) => {
  const GroupIcon = icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        <GroupIcon size={14} />
        {title}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const OptionIcon = option.icon;

          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(option.value)}
                aria-label={option.label}
              />
              {OptionIcon && <OptionIcon size={16} />}
              <span className="min-w-0 truncate">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const CountryGroup = ({ countries, selectedValues, onToggle }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
      <Globe2 size={14} />
      Country
    </div>
    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
      {countries.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <label
            key={option.value}
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(option.value)}
              aria-label={option.label}
            />
            <span aria-hidden="true">{option.icon}</span>
            <span className="min-w-0 truncate">{option.label}</span>
          </label>
        );
      })}
    </div>
  </div>
);

const DestinationFilter = ({
  totalDestinations,
  searchQuery,
  setSearchQuery,
  countries: selectedCountries,
  setCountries,
  destinationTypes,
  setDestinationTypes,
  budgetTiers,
  setBudgetTiers,
  difficulties,
  setDifficulties,
  actions,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [draftCountries, setDraftCountries] = useState(selectedCountries);
  const [draftDestinationTypes, setDraftDestinationTypes] =
    useState(destinationTypes);
  const [draftBudgetTiers, setDraftBudgetTiers] = useState(budgetTiers);
  const [draftDifficulties, setDraftDifficulties] = useState(difficulties);

  const countries = useMemo(
    () =>
      COUNTRY_LIST.map((country) => ({
        value: COUNTRY_CODE_BY_NAME[country.name] || country.name,
        label: country.name,
        icon: country.flag,
      })),
    [],
  );

  const appliedFilterCount = filterCount(
    selectedCountries,
    destinationTypes,
    budgetTiers,
    difficulties,
  );
  const draftFilterCount = filterCount(
    draftCountries,
    draftDestinationTypes,
    draftBudgetTiers,
    draftDifficulties,
  );
  const applyFilters = () => {
    setCountries(draftCountries);
    setDestinationTypes(draftDestinationTypes);
    setBudgetTiers(draftBudgetTiers);
    setDifficulties(draftDifficulties);
    setOpen(false);
  };

  const cancelFilters = () => {
    setDraftCountries(selectedCountries);
    setDraftDestinationTypes(destinationTypes);
    setDraftBudgetTiers(budgetTiers);
    setDraftDifficulties(difficulties);
    setOpen(false);
  };

  const clearDraftFilters = () => {
    setDraftCountries([]);
    setDraftDestinationTypes([]);
    setDraftBudgetTiers([]);
    setDraftDifficulties([]);
  };

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      setDraftCountries(selectedCountries);
      setDraftDestinationTypes(destinationTypes);
      setDraftBudgetTiers(budgetTiers);
      setDraftDifficulties(difficulties);
    }

    setOpen(nextOpen);
  };

  return (
    <div
      className={cn(
        "flex gap-2 md:gap-3 items-center md:justify-end",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1 max-w-sm">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search Bali, Kyoto, mountains..."
          className="h-12 rounded-full border-slate-200 bg-white pl-11 pr-11 text-sm shadow-none focus-visible:ring-primary/15"
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

      <div className="relative">
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-full border-slate-200"
              aria-label="Open destination filters"
            >
              <SlidersHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[min(calc(100vw-2rem),420px)] rounded-2xl border-slate-200 bg-white p-0 shadow-xl"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Match your trip
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {totalDestinations} matching{" "}
                    {totalDestinations === 1 ? "place" : "places"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearDraftFilters}
                  disabled={!draftFilterCount}
                  aria-label="Reset selected filter options"
                  className="rounded-full text-slate-500 hover:text-slate-950"
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
            </div>

            <div className="max-h-[64vh] space-y-5 overflow-y-auto p-4">
              <OptionGroup
                title="Trip style"
                icon={Compass}
                options={DESTINATION_TYPE_OPTIONS}
                selectedValues={draftDestinationTypes}
                onToggle={(value) =>
                  setDraftDestinationTypes((values) =>
                    toggleValue(values, value),
                  )
                }
              />
              <CountryGroup
                countries={countries}
                selectedValues={draftCountries}
                onToggle={(value) =>
                  setDraftCountries((values) => toggleValue(values, value))
                }
              />
              <OptionGroup
                title="Budget level"
                icon={Banknote}
                options={BUDGET_TIER_OPTIONS}
                selectedValues={draftBudgetTiers}
                onToggle={(value) =>
                  setDraftBudgetTiers((values) => toggleValue(values, value))
                }
              />
              <OptionGroup
                title="Difficulty"
                icon={Sparkles}
                options={DIFFICULTY_OPTIONS}
                selectedValues={draftDifficulties}
                onToggle={(value) =>
                  setDraftDifficulties((values) => toggleValue(values, value))
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4">
              <Button type="button" variant="outline" onClick={cancelFilters}>
                Cancel
              </Button>
              <Button type="button" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {appliedFilterCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {appliedFilterCount}
          </span>
        )}
      </div>
      {actions}
    </div>
  );
};

export default DestinationFilter;
