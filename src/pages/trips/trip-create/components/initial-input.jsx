import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { SingleItemSelectGroup } from "@/components/shared/form-input";
import LocationInput from "@/components/shared/location-input";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useUpdateTripMutation } from "@/features/trips/tripApiSlice";
import { useUserProfileQuery } from "@/features/auth/authApiSlice";
import { AuthorMessage } from "@/components/shared/utils";
import {
  isPlanningStepAfter,
  planningStepValues,
} from "../planning-step-utils";
import {
  ACCOMMODATION_OPTIONS,
  BUDGET_TIER_OPTIONS,
  TRAVELLER_TYPE_OPTIONS,
} from "../../constants";

const normalizeCurrency = (currency) =>
  typeof currency === "string" ? currency.trim().toUpperCase() : "";

const getCurrencyOptions = (preferredCurrency, destinationCurrency) => {
  const options = [
    {
      value: "USD",
      label: "USD",
    },
    {
      value: normalizeCurrency(preferredCurrency),
      label: `${normalizeCurrency(preferredCurrency)}`,
    },
    {
      value: normalizeCurrency(destinationCurrency),
      label: `${normalizeCurrency(destinationCurrency)}`,
    },
  ];

  return options.filter(
    (option, index) =>
      option.value &&
      options.findIndex(({ value }) => value === option.value) === index,
  );
};

const getTravelerCountForType = (travelerType, currentCount) => {
  if (travelerType === "solo") return "1";
  if (travelerType === "couple") return "2";

  return Number(currentCount) > 0 ? currentCount : "3";
};

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const getAccommodationPreference = (trip) =>
  trip?.accommodation_preference ||
  trip?.preferences?.accommodation_preference ||
  trip?.preferences?.accommotation_preference ||
  "";

const getTrackedLocation = (lastTrackedAddress) => {
  if (typeof lastTrackedAddress === "string") {
    return {
      address: lastTrackedAddress,
      latitude: "",
      longitude: "",
    };
  }

  return {
    address:
      lastTrackedAddress?.address ||
      lastTrackedAddress?.formatted_address ||
      lastTrackedAddress?.name ||
      "",
    latitude: lastTrackedAddress?.latitude ?? lastTrackedAddress?.lat ?? "",
    longitude:
      lastTrackedAddress?.longitude ??
      lastTrackedAddress?.lng ??
      lastTrackedAddress?.lon ??
      "",
  };
};

const getInitialInfoForm = (trip = {}) => ({
  budget_tier: trip?.budget_tier || "comfort",
  budget_currency: normalizeCurrency(trip?.budget_currency) || "USD",
  start_date: trip?.start_date || "",
  days: trip?.duration_days ? String(trip.duration_days) : "",
  travelers_count: trip?.travelers_count ? String(trip.travelers_count) : "1",
  traveler_type: trip?.traveler_type || "solo",
  accommodation_preference: getAccommodationPreference(trip),
  start_location_address: trip?.start_location?.address || "",
  start_location_latitude: trip?.start_location?.latitude
    ? String(trip.start_location?.latitude)
    : "",
  start_location_longitude: trip?.start_location?.longitude
    ? String(trip.start_location?.longitude)
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
  const authenticatedUser = useSelector((state) => state.auth.user);
  const { data: userProfileResponse } = useUserProfileQuery({
    username: authenticatedUser?.username,
  });

  const userProfile = userProfileResponse?.data || userProfileResponse;
  const [internalForm, setInternalForm] = useState(() =>
    getInitialInfoForm(trip),
  );
  const [updateTrip, { isLoading: isUpdatingTrip }] = useUpdateTripMutation();
  const form = controlledForm || internalForm;
  const isExistingTrip = !!trip && !controlledForm;
  const isSubmitting = isControlledSubmitting || isUpdatingTrip;
  const formClassName = className || "flex min-h-0 flex-col md:h-full";
  const nextStepExists =
    isExistingTrip &&
    isPlanningStepAfter(trip?.current_step, planningStepValues.getStarted);
  const resolvedSubmitLabel =
    submitLabel || (nextStepExists ? "View Preferences" : "Start Trip Plan");
  const showTravelerCount =
    form.traveler_type === "family" || form.traveler_type === "group";
  const destinationName = destination?.name || "";
  const destinationCurrency =
    destination?.currency || destination?.currency_code || "";
  const currencyOptions = useMemo(
    () =>
      getCurrencyOptions(userProfile?.preferred_currency, destinationCurrency),
    [destinationCurrency, userProfile?.preferred_currency],
  );

  const updateField = useCallback(
    (field, value) => {
      if (onControlledFieldChange) {
        onControlledFieldChange(field, value);
        return;
      }

      setInternalForm((current) => ({ ...current, [field]: value }));
    },
    [onControlledFieldChange],
  );

  /* The remote profile supplies defaults after the form's initial render. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!userProfile) return;

    const trackedLocation = getTrackedLocation(
      userProfile.last_tracked_address,
    );

    if (!form.start_location_address && trackedLocation.address) {
      updateField("start_location_address", String(trackedLocation.address));
    }
    if (!form.start_location_latitude && trackedLocation.latitude !== "") {
      updateField("start_location_latitude", String(trackedLocation.latitude));
    }
    if (!form.start_location_longitude && trackedLocation.longitude !== "") {
      updateField(
        "start_location_longitude",
        String(trackedLocation.longitude),
      );
    }
    if (!form.accommodation_preference && userProfile.preferred_accommodation) {
      updateField(
        "accommodation_preference",
        userProfile.preferred_accommodation,
      );
    }
  }, [
    form.accommodation_preference,
    form.start_location_address,
    form.start_location_latitude,
    form.start_location_longitude,
    updateField,
    userProfile,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
      <div className="custom-scrollbar space-y-5 p-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:[scrollbar-gutter:stable]">
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
            }}
            onChange={(location) => {
              updateField("start_location_address", location.address || "");
              updateField("start_location_latitude", location.latitude || "");
              updateField("start_location_longitude", location.longitude || "");
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

          <SingleItemSelectGroup
            title="Traveller type"
            options={TRAVELLER_TYPE_OPTIONS}
            value={form.traveler_type}
            onValueChange={updateTravelerType}
          />

          {showTravelerCount ? (
            <FloatingInput
              name="trip-travelers"
              type="number"
              label="Travellers"
              min="2"
              placeholder="4"
              className="max-w-32"
              value={form.travelers_count}
              onChange={(event) =>
                updateField("travelers_count", event.target.value)
              }
            />
          ) : null}

          <SingleItemSelectGroup
            title="Budget tier"
            options={BUDGET_TIER_OPTIONS}
            value={form.budget_tier}
            onValueChange={(value) => updateField("budget_tier", value)}
          />

          <SingleItemSelectGroup
            title="Currency"
            options={currencyOptions}
            value={form.budget_currency}
            onValueChange={(value) => updateField("budget_currency", value)}
          />

          <SingleItemSelectGroup
            title="Accommodation"
            options={ACCOMMODATION_OPTIONS}
            value={form.accommodation_preference}
            onValueChange={(value) =>
              updateField("accommodation_preference", value)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-slate-200 bg-white p-4 md:grid-cols-2">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full order-2 md:order-1"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="rounded-full order-1 md:order-2">
          {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : null}
          {resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TripPlanInitialInput;
