import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTRY_LIST } from "@/lib/countries";

const formatLabel = (value) => value.replaceAll("_", " ");

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

const DestinationFilter = ({
  demoDestinations,
  searchQuery,
  setSearchQuery,
  country,
  setCountry,
  destinationType,
  setDestinationType,
  clearFilters,
}) => {
  const destinationTypes = useMemo(
    () => [
      ...new Set(
        demoDestinations.map((destination) => destination.destination_type),
      ),
    ],
    [demoDestinations],
  );
  const countries = useMemo(
    () =>
      COUNTRY_LIST.map((country) => ({
        value: COUNTRY_CODE_BY_NAME[country.name] || country.name,
        label: country.name,
        icon: country.flag,
      })),
    [],
  );

  const destTypesOptions = useMemo(
    () => [
      ...destinationTypes.map((type) => ({
        value: type,
        label: formatLabel(type),
      })),
    ],
    [destinationTypes],
  );
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Filters</h2>
            <p className="text-sm text-slate-500">Narrow the browse list</p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search destinations"
                className="h-11 bg-white pl-9 rounded-full"
              />
            </div>
          </label>

          <FloatingSelect
            label="Country"
            placeholder="Select country"
            value={country}
            onValueChange={setCountry}
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

          <FloatingSelect
            label="Destination type"
            placeholder="Select destination type"
            value={destinationType}
            onValueChange={setDestinationType}
          >
            {destTypesOptions.map((option) => {
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
      </div>
    </aside>
  );
};

export default DestinationFilter;
