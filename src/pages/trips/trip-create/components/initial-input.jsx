import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import LocationInput from "@/components/shared/location-input";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useUpdateTripMutation } from "@/features/trips/tripApiSlice";
import { AuthorMessage } from "@/components/shared/utils";

const travelerTypes = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
];

const budgetTiers = [
  { value: "budget", label: "Budget" },
  { value: "mid", label: "Mid-range" },
  { value: "premium", label: "Premium" },
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

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const getStepNumber = (trip) => Number(trip?.current_step);

const getInitialInfoForm = (trip = {}) => ({
  budget_tier: trip?.budget_tier || "mid",
  budget_currency: trip?.budget_currency || "",
  start_date: trip?.start_date || "",
  days: trip?.days ? String(trip.days) : "",
  travelers_count: trip?.travelers_count ? String(trip.travelers_count) : "1",
  traveler_type: trip?.traveler_type || "solo",
  accommodation_preference: trip?.accommodation_preference || "",
  start_location_address: trip?.start_location_address || "",
  start_location_latitude: trip?.start_location_latitude
    ? String(trip.start_location_latitude)
    : "",
  start_location_longitude: trip?.start_location_longitude
    ? String(trip.start_location_longitude)
    : "",
  start_location_accuracy: trip?.start_location_accuracy
    ? String(trip.start_location_accuracy)
    : "",
});

const TripPlanInitialInput = ({
  trip,
  destination,
  form: controlledForm,
  onFieldChange: onControlledFieldChange,
  onSubmit,
  isSubmitting: isControlledSubmitting,
  getEndDate,
  onTripUpdated,
  submitLabel,
  className,
  onClose,
  onStepSelect,
}) => {
  const [internalForm, setInternalForm] = useState(() =>
    getInitialInfoForm(trip),
  );
  const [updateTrip, { isLoading: isUpdatingTrip }] = useUpdateTripMutation();
  const form = controlledForm || internalForm;
  const isExistingTrip = !!trip && !controlledForm;
  const isSubmitting = isControlledSubmitting || isUpdatingTrip;
  const formClassName = className || "flex h-full min-h-0 flex-col";
  const tripStepNumber = getStepNumber(trip);
  const nextStepExists =
    isExistingTrip && Number.isFinite(tripStepNumber) && tripStepNumber > 1;
  const resolvedSubmitLabel =
    submitLabel || (nextStepExists ? "View Preferences" : "Start Trip Plan");
  const showTravelerCount =
    form.traveler_type === "family" || form.traveler_type === "group";
  const destinationName = destination?.name || "";

  const updateField = (field, value) => {
    if (onControlledFieldChange) {
      onControlledFieldChange(field, value);
      return;
    }

    setInternalForm((current) => ({ ...current, [field]: value }));
  };

  const updateTravelerType = (value) => {
    updateField("traveler_type", value);
    updateField(
      "travelers_count",
      getTravelerCountForType(value, form.travelers_count),
    );
  };

  const handleUpdateTrip = async (event) => {
    event.preventDefault();

    const tripId = getTripId(trip);
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    if (
      !form.start_date ||
      !form.days ||
      !form.budget_tier ||
      !form.travelers_count ||
      !form.traveler_type ||
      !form.start_location_address
    ) {
      toast.error("Fill in the trip basics before updating the plan.");
      return;
    }

    const startLatitude = Number(form.start_location_latitude);
    const startLongitude = Number(form.start_location_longitude);
    const startAccuracy = Number(form.start_location_accuracy);

    try {
      const response = await updateTrip({
        trip_id: tripId,
        start_date: form.start_date,
        days: Number(form.days),
        budget_tier: form.budget_tier,
        ...(form.budget_currency
          ? { budget_currency: form.budget_currency }
          : {}),
        traveler_type: form.traveler_type,
        travelers_count: Number(form.travelers_count),
        ...(form.accommodation_preference
          ? { accommodation_preference: form.accommodation_preference }
          : {}),
        start_location_address: form.start_location_address,
        ...(Number.isFinite(startLatitude) && Number.isFinite(startLongitude)
          ? {
              start_location_latitude: startLatitude,
              start_location_longitude: startLongitude,
              ...(Number.isFinite(startAccuracy)
                ? { start_location_accuracy: startAccuracy }
                : {}),
            }
          : {}),
      }).unwrap();

      onTripUpdated?.(response?.data || response);
      toast.success("Initial trip info updated.");
    } catch (error) {
      toast.error(
        error?.data?.message || "Could not update trip info. Try again.",
      );
    }
  };

  const handleSubmit = nextStepExists
    ? (event) => {
        event.preventDefault();
        onStepSelect?.(1);
      }
    : onSubmit || handleUpdateTrip;

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <AuthorMessage
          message={`Hi! I am tutle, your trip planning assistant. I will help you plan a trip at ${
            destinationName
          }. Let's start with some basic infomation first.`}
        />

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
          <p className="text-sm font-semibold text-slate-950">
            Basic Information
          </p>
          <LocationInput
            value={{
              address: form.start_location_address,
              latitude: form.start_location_latitude,
              longitude: form.start_location_longitude,
              accuracy: form.start_location_accuracy,
            }}
            onChange={(location) => {
              updateField("start_location_address", location.address || "");
              updateField("start_location_latitude", location.latitude || "");
              updateField("start_location_longitude", location.longitude || "");
              updateField("start_location_accuracy", location.accuracy || "");
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
                updateField("start_date", event.target.value)
              }
            />

            <FloatingInput
              name="trip-days"
              type="number"
              label="Duration"
              min="1"
              placeholder="Days"
              value={form.days}
              onChange={(event) => updateField("days", event.target.value)}
            />
          </div>

          {form.start_date && form.days && (
            <p className="-mt-2 text-xs text-slate-500">
              End date will be {getEndDate(form.start_date, form.days)}.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FloatingSelect
              label="Currency"
              placeholder="Optional"
              value={form.budget_currency}
              onValueChange={(value) => updateField("budget_currency", value)}
            >
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </FloatingSelect>

            <FloatingSelect
              label="Accommodation"
              placeholder="Optional"
              value={form.accommodation_preference}
              onValueChange={(value) =>
                updateField("accommodation_preference", value)
              }
            >
              {accommodationPreferences.map((preference) => (
                <SelectItem key={preference.value} value={preference.value}>
                  {preference.label}
                </SelectItem>
              ))}
            </FloatingSelect>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-800">Traveller type</p>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {travelerTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex cursor-pointer items-center gap-2 text-sm transition ${
                    form.traveler_type === type.value
                      ? "text-primary"
                      : "text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="traveler-type"
                    value={type.value}
                    checked={form.traveler_type === type.value}
                    onChange={() => updateTravelerType(type.value)}
                    className="size-4 accent-primary"
                  />
                  <span className="font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {showTravelerCount ? (
              <FloatingInput
                name="trip-travelers"
                type="number"
                label="Travellers"
                min="3"
                placeholder="4"
                value={form.travelers_count}
                onChange={(event) =>
                  updateField("travelers_count", event.target.value)
                }
              />
            ) : null}
          </div>

          <div className="space-y-4 -mt-2">
            <p className="text-sm font-medium text-slate-800">Budget tier</p>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {budgetTiers.map((tier) => (
                <label
                  key={tier.value}
                  className={`flex cursor-pointer items-center gap-2 text-sm transition ${
                    form.budget_tier === tier.value
                      ? "text-primary"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="budget-tier"
                    value={tier.value}
                    checked={form.budget_tier === tier.value}
                    onChange={() => updateField("budget_tier", tier.value)}
                    className="size-4 accent-primary"
                  />
                  <span className="font-medium">{tier.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <Sparkles size={17} />
          )}
          {resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TripPlanInitialInput;
