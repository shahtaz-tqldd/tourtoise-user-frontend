import React from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import LocationInput from "@/components/shared/location-input";
import { Loader2, Sparkles } from "lucide-react";

const travelerTypes = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
];

const currencies = [
  { value: "USD", label: "USD" },
  { value: "BDT", label: "BDT" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "THB", label: "THB" },
  { value: "AED", label: "AED" },
];

const accommodationPreferences = [
  { value: "budget", label: "Budget stays" },
  { value: "mid_range", label: "Mid Range" },
  { value: "boutique", label: "Boutique stays" },
  { value: "luxury", label: "Luxury hotels" },
  { value: "apartment", label: "Apartment / villa" },
  { value: "hostel", label: "Hostel" },
  { value: "any", label: "Flexible" },
];

const getTravelerCountForType = (travelerType, currentCount) => {
  if (travelerType === "solo") return "1";
  if (travelerType === "couple") return "2";

  return Number(currentCount) > 0 ? currentCount : "3";
};

const TripPlanInitialInput = ({
  destination,
  form,
  onFieldChange,
  onSubmit,
  isSubmitting,
  getEndDate,
  introTitle = "Start a new plan",
  introDescription,
  submitLabel = "Create trip plan",
  className = "custom-scrollbar flex-1 space-y-5 overflow-y-auto p-4",
}) => {
  const showTravelerCount =
    form.traveler_type === "family" || form.traveler_type === "group";
  const destinationName = destination?.name || "";

  const updateTravelerType = (value) => {
    onFieldChange("traveler_type", value);
    onFieldChange(
      "travelers_count",
      getTravelerCountForType(value, form.travelers_count),
    );
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 text-primary" size={18} />
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              {introTitle}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {introDescription ||
                `Add the basics so the trip agent can create the first planning draft for ${
                  destinationName || "this destination"
                }.`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <LocationInput
          value={{
            address: form.start_location_address,
            latitude: form.start_location_latitude,
            longitude: form.start_location_longitude,
            accuracy: form.start_location_accuracy,
          }}
          onChange={(location) => {
            onFieldChange("start_location_address", location.address || "");
            onFieldChange("start_location_latitude", location.latitude || "");
            onFieldChange("start_location_longitude", location.longitude || "");
            onFieldChange("start_location_accuracy", location.accuracy || "");
          }}
          className="!mb-6"
        />

        <div className="grid grid-cols-2 gap-3">
          <FloatingInput
            name="trip-start-date"
            type="date"
            label="Start date"
            value={form.start_date}
            onChange={(event) =>
              onFieldChange("start_date", event.target.value)
            }
          />

          <FloatingInput
            name="trip-days"
            type="number"
            label="Duration"
            min="1"
            placeholder="Days"
            value={form.days}
            onChange={(event) => onFieldChange("days", event.target.value)}
          />
        </div>

        {form.start_date && form.days && (
          <p className="-mt-2 text-xs text-slate-500">
            End date will be {getEndDate(form.start_date, form.days)}.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FloatingSelect
            label="Traveller type"
            placeholder="Select type"
            value={form.traveler_type}
            onValueChange={updateTravelerType}
          >
            {travelerTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          {showTravelerCount ? (
            <FloatingInput
              name="trip-travelers"
              type="number"
              label="Travellers"
              min="3"
              placeholder="4"
              value={form.travelers_count}
              onChange={(event) =>
                onFieldChange("travelers_count", event.target.value)
              }
            />
          ) : (
            <FloatingInput
              name="trip-travelers"
              type="number"
              label="Travellers"
              value={form.travelers_count}
              disabled
              inputClassName="disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
            />
          )}
        </div>

        <div className="grid grid-cols-[1fr_128px] gap-3">
          <FloatingInput
            name="trip-budget"
            type="number"
            label="Total budget"
            min="0"
            placeholder="2500"
            value={form.total_budget}
            onChange={(event) =>
              onFieldChange("total_budget", event.target.value)
            }
          />

          <FloatingSelect
            label="Currency"
            placeholder="Currency"
            value={form.budget_currency}
            onValueChange={(value) => onFieldChange("budget_currency", value)}
          >
            {currencies.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </FloatingSelect>
        </div>

        <FloatingSelect
          label="Accommodation"
          placeholder="Select preference"
          value={form.accommodation_preference}
          onValueChange={(value) =>
            onFieldChange("accommodation_preference", value)
          }
        >
          {accommodationPreferences.map((preference) => (
            <SelectItem key={preference.value} value={preference.value}>
              {preference.label}
            </SelectItem>
          ))}
        </FloatingSelect>
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={17} />
        ) : (
          <Sparkles size={17} />
        )}
        {submitLabel}
      </Button>
    </form>
  );
};

export default TripPlanInitialInput;
