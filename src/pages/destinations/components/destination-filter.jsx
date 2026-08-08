import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { COUNTRY_LIST } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { Banknote, Compass, SlidersHorizontal, Sparkles } from "lucide-react";
import SearchBar from "@/components/shared/search-bar";
import PreviewDropdown from "@/components/shared/preview-dropdown";
import { DESTINATION_TYPE_OPTIONS } from "../constants";

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
      <div className="gap-2 flex flex-wrap">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const OptionIcon = option.icon;

          return (
            <label
              key={option.value}
              className={cn(
                "flex w-fit cursor-pointer gap-2 rounded-full py-2 pl-3 pr-4 text-sm font-semibold transition",
                isSelected
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-primary/10",
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(option.value)}
                aria-label={option.label}
                className="hidden"
              />
              {OptionIcon && <OptionIcon size={15} />}
              <span className="min-w-0 truncate">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const CountrySelect = ({ countries, selectedValue, onValueChange }) => (
  <FloatingSelect
    label="Country"
    placeholder="Select Country"
    value={selectedValue || undefined}
    onValueChange={onValueChange}
    contentClassName="max-h-64 rounded-xl border-slate-200 bg-white"
  >
    {countries.map((country) => (
      <SelectItem key={country.value} value={country.value}>
        <span aria-hidden="true">{country.icon}</span>
        <span>{country.label}</span>
      </SelectItem>
    ))}
  </FloatingSelect>
);

const DestinationFilter = ({
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

  const clearFilters = () => {
    setDraftCountries([]);
    setDraftDestinationTypes([]);
    setDraftBudgetTiers([]);
    setDraftDifficulties([]);
    setCountries([]);
    setDestinationTypes([]);
    setBudgetTiers([]);
    setDifficulties([]);
    setOpen(false);
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
      <SearchBar
        placeholder="Search with destination name, country, or type"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        className=""
      />

      <div className="relative">
        <PreviewDropdown
          open={open}
          onOpenChange={handleOpenChange}
          title="Filter destinations"
          description="Choose destination types, country, budget, and difficulty."
          trigger={
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-full border-slate-200"
              aria-label="Open destination filters"
            >
              <SlidersHorizontal size={16} />
            </Button>
          }
        >
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-bold text-slate-950">
                Filter Destination
              </h2>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
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
            <CountrySelect
              countries={countries}
              selectedValue={draftCountries[0]}
              onValueChange={(value) => setDraftCountries([value])}
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

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              onClick={draftFilterCount ? clearFilters : cancelFilters}
              aria-label="Reset selected filter options"
            >
              {draftFilterCount ? "Clear Filter" : "Cancel"}
            </Button>
            <Button type="button" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </PreviewDropdown>
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
