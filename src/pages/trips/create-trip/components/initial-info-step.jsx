import React, { useState } from "react";
import { toast } from "sonner";
import { useUpdateTripMutation } from "@/features/trips/tripApiSlice";
import TripPlanInitialInput from "./initial-input";

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const getInitialInfoForm = (trip = {}) => ({
  total_budget: trip?.total_budget ? String(trip.total_budget) : "",
  budget_currency: trip?.budget_currency || "USD",
  start_date: trip?.start_date || "",
  days: trip?.days ? String(trip.days) : "",
  travelers_count: trip?.travelers_count
    ? String(trip.travelers_count)
    : "1",
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

const InitialInfoStep = ({ trip, destination, getEndDate, onTripUpdated }) => {
  const [form, setForm] = useState(() => getInitialInfoForm(trip));
  const [updateTrip, { isLoading }] = useUpdateTripMutation();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const tripId = getTripId(trip);
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    if (
      !form.start_date ||
      !form.days ||
      !form.travelers_count ||
      !form.traveler_type ||
      !form.accommodation_preference ||
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
        traveler_type: form.traveler_type,
        travelers_count: Number(form.travelers_count),
        accommodation_preference: form.accommodation_preference,
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
        ...(form.total_budget
          ? {
              total_budget: Number(form.total_budget),
              budget_currency: form.budget_currency,
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

  return (
    <TripPlanInitialInput
      destination={destination}
      form={form}
      onFieldChange={updateField}
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      getEndDate={getEndDate}
      introTitle="Initial info taking"
      introDescription="Review and update the initial trip information used for this plan."
      submitLabel="Update initial info"
      className="space-y-5"
    />
  );
};

export default InitialInfoStep;
