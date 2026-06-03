import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Pencil, Loader2, Sparkles, Plus } from "lucide-react";
import {
  useCreateTripMutation,
  useTripDetailQuery,
  useTripListQuery,
} from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import DocumentsPackupStep from "./components/documents-packup-step";
import InitialInfoStep from "./components/initial-info-step";
import TripPlanInitialInput from "./components/initial-input";
import ItineraryStep from "./components/itinerary-step";
import OverviewLockStep from "./components/overview-lock-step";
import RecommendationsStep from "./components/recommendations-step";
import UserProfileStep from "./components/user-profile-step";

const createInitialForm = () => ({
  total_budget: "",
  budget_currency: "USD",
  start_date: "",
  days: "",
  travelers_count: "1",
  traveler_type: "solo",
  accommodation_preference: "",
  start_location_address: "",
  start_location_latitude: "",
  start_location_longitude: "",
  start_location_accuracy: "",
});

const titleTemplates = [
  "{destination} travel plan",
  "{destination} getaway",
  "{destination} itinerary",
  "{destination} holiday plan",
  "{destination} trip",
  "Explore {destination}",
];

const planningSteps = [
  {
    key: "initial_info",
    title: "Initial info",
    description: "Initial info taking",
    component: InitialInfoStep,
  },
  {
    key: "user_profile",
    title: "Profile",
    description: "User profile and customization",
    component: UserProfileStep,
  },
  {
    key: "recommendations",
    title: "Recommendations",
    description: "Recommendations for spots, activities and foods",
    component: RecommendationsStep,
  },
  {
    key: "itinerary",
    title: "Itinerary",
    description: "Day wise itineraries planning",
    component: ItineraryStep,
  },
  {
    key: "documents_packup",
    title: "Documents",
    description: "Documents and packup",
    component: DocumentsPackupStep,
  },
  {
    key: "overview_lock",
    title: "Overview",
    description: "Overview and locking up",
    component: OverviewLockStep,
  },
];

const currentStepAliases = {
  initial_info_taking: "initial_info",
  initial_information: "initial_info",
  user_profile_and_customization: "user_profile",
  profile: "user_profile",
  customization: "user_profile",
  recommendations_for_spots_activities_and_foods: "recommendations",
  spots_activities_foods: "recommendations",
  activities_foods: "recommendations",
  day_wise_itineraries_planning: "itinerary",
  day_wise_itinerary: "itinerary",
  itineraries: "itinerary",
  documents_and_packup: "documents_packup",
  documents_packup: "documents_packup",
  packup: "documents_packup",
  overview_and_locking_up: "overview_lock",
  overview_locking: "overview_lock",
  locking_up: "overview_lock",
};

const getDestinationSlug = (destination) =>
  destination?.slug || destination?.destination_slug || destination?.id;

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const getTripDetailId = (trip) =>
  getTripId(trip) || trip?.slug || trip?.trip_slug;

const unwrapDetail = (response) => response?.data || response || null;

const normalizeStepValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getCurrentStepIndex = (trip) => {
  const currentStep = trip?.current_step;
  const numericStep = Number(currentStep);

  if (Number.isInteger(numericStep)) {
    const oneBasedStep = numericStep - 1;
    if (oneBasedStep >= 0 && oneBasedStep < planningSteps.length) {
      return oneBasedStep;
    }

    if (numericStep >= 0 && numericStep < planningSteps.length) {
      return numericStep;
    }
  }

  const stepKey = normalizeStepValue(currentStep);
  const aliasedStepKey = currentStepAliases[stepKey] || stepKey;
  const stepIndex = planningSteps.findIndex(
    (step) => step.key === aliasedStepKey,
  );

  return stepIndex >= 0 ? stepIndex : 0;
};

const unwrapList = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.results)) return data.data.results;

  return [];
};

const getTripTitle = (trip, destination) =>
  trip?.title || trip?.name || trip?.trip_name || `${destination?.name} plan`;

const getTripDates = (trip) => {
  const startDate = trip?.start_date;
  const endDate = trip?.end_date;

  if (startDate && endDate) return `${startDate} to ${endDate}`;
  if (startDate) return `Starts ${startDate}`;
  if (trip?.days) return `${trip.days} days`;

  return "Dates not set";
};

const getGeneratedTripTitle = (destinationName) => {
  const placeName = destinationName || "Destination";
  const template =
    titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

  return template.replace("{destination}", placeName);
};

const getEndDate = (startDate, days) => {
  const tripDays = Number(days);
  if (!startDate || !Number.isFinite(tripDays) || tripDays < 1) return "";

  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + tripDays - 1);

  return date.toISOString().slice(0, 10);
};

const TripPlanningDrawer = ({ destination, open, onOpenChange }) => {
  const destinationSlug = getDestinationSlug(destination);
  const destinationName = destination?.name || "";
  const [form, setForm] = useState(createInitialForm);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isStartingNewPlan, setIsStartingNewPlan] = useState(false);
  const [tripTitle, setTripTitle] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [furthestStep, setFurthestStep] = useState(0);
  const generatedTripTitle = useMemo(
    () => getGeneratedTripTitle(destinationName),
    [destinationName],
  );
  const currentTripTitle = tripTitle ?? generatedTripTitle;

  const { data: tripListData, isFetching: isCheckingTrips } = useTripListQuery(
    open && destinationSlug
      ? { destination_slug: destinationSlug, page: 1, page_size: 20 }
      : skipToken,
  );
  const [createTrip, { isLoading: isCreatingTrip }] = useCreateTripMutation();

  const destinationTrips = useMemo(
    () => unwrapList(tripListData),
    [tripListData],
  );
  const previousTrip = destinationTrips[0] || null;
  const shouldLoadSingleTrip =
    destinationTrips.length === 1 && !isStartingNewPlan && !createdTrip;
  const detailSourceTrip =
    !isCheckingTrips && !createdTrip && !isStartingNewPlan
      ? selectedTrip || (shouldLoadSingleTrip ? previousTrip : null)
      : null;
  const detailTripId = getTripDetailId(detailSourceTrip);
  const {
    data: tripDetailData,
    isFetching: isFetchingTripDetail,
    isError: tripDetailError,
  } = useTripDetailQuery(open && detailTripId ? detailTripId : skipToken);
  const detailedTrip = useMemo(
    () => unwrapDetail(tripDetailData),
    [tripDetailData],
  );
  const activeTrip = createdTrip || detailedTrip || null;
  const tripCurrentStep = activeTrip ? getCurrentStepIndex(activeTrip) : 0;
  const displayedStep = activeStep ?? tripCurrentStep;
  const unlockedStep = Math.max(furthestStep, tripCurrentStep, displayedStep);
  const displayedStepConfig = planningSteps[displayedStep];
  const ActiveStepComponent = displayedStepConfig.component;
  const activeTripId = getTripId(activeTrip);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    if (!destinationSlug) {
      toast.error("Destination slug is missing.");
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
      toast.error("Fill in the trip basics before starting the plan.");
      return;
    }

    const totalBudget = Number(form.total_budget);
    const startLatitude = Number(form.start_location_latitude);
    const startLongitude = Number(form.start_location_longitude);
    const startAccuracy = Number(form.start_location_accuracy);
    const title = currentTripTitle.trim();

    if (!title) {
      toast.error("Add a trip title before starting the plan.");
      return;
    }

    try {
      const response = await createTrip({
        title,
        destination_slugs: [destinationSlug],
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
              total_budget: totalBudget,
              budget_currency: form.budget_currency,
            }
          : {}),
      }).unwrap();
      const createdTrip = response?.data || response;
      const currentStep = getCurrentStepIndex(createdTrip);

      setCreatedTrip(createdTrip);
      setActiveStep(currentStep);
      setFurthestStep(currentStep);
      toast.success("Trip planning started.");
      setIsStartingNewPlan(false);
      setSelectedTrip(null);
    } catch (error) {
      toast.error(
        error?.data?.message || "Could not start trip planning. Try again.",
      );
    }
  };

  const handleStartNewPlan = () => {
    setCreatedTrip(null);
    setSelectedTrip(null);
    setIsStartingNewPlan(true);
    setActiveStep(null);
    setFurthestStep(0);
  };

  const handleSelectTrip = (trip) => {
    const currentStep = getCurrentStepIndex(trip);

    setCreatedTrip(null);
    setSelectedTrip(trip);
    setIsStartingNewPlan(false);
    setActiveStep(currentStep);
    setFurthestStep(currentStep);
  };

  const handleStepSelect = (stepIndex) => {
    if (stepIndex > unlockedStep) return;
    setActiveStep(stepIndex);
  };

  const handleStepComplete = () => {
    const nextStep = Math.min(displayedStep + 1, planningSteps.length - 1);

    setFurthestStep((current) =>
      Math.min(Math.max(current, nextStep), planningSteps.length - 1),
    );
    setActiveStep(nextStep);
  };

  const handleTripUpdated = (updatedTrip) => {
    const updatedTripId = getTripId(updatedTrip);

    if (
      updatedTripId &&
      activeTrip &&
      getTripId(activeTrip) === updatedTripId &&
      !createdTrip &&
      !selectedTrip
    ) {
      setSelectedTrip({ ...activeTrip, ...updatedTrip });
    }

    setCreatedTrip((current) =>
      current && getTripId(current) === updatedTripId
        ? { ...current, ...updatedTrip }
        : current,
    );
    setSelectedTrip((current) =>
      current && getTripId(current) === updatedTripId
        ? { ...current, ...updatedTrip }
        : current,
    );
  };

  const showTripList =
    !isCheckingTrips &&
    !isStartingNewPlan &&
    !selectedTrip &&
    !createdTrip &&
    destinationTrips.length > 1;
  const showSetupForm =
    !isCheckingTrips &&
    !isFetchingTripDetail &&
    (isStartingNewPlan || (!destinationTrips.length && !activeTrip));
  const showAgent = !!activeTrip && !isFetchingTripDetail;
  const showInitialLoader =
    isCheckingTrips || (!!detailTripId && isFetchingTripDetail);
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setCreatedTrip(null);
      setSelectedTrip(null);
      setIsStartingNewPlan(false);
      setForm(createInitialForm());
      setTripTitle(null);
      setActiveStep(null);
      setFurthestStep(0);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-full overflow-hidden bg-white p-0 sm:max-w-[480px]"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-slate-200 pr-12 text-left">
            <SheetTitle className="flex items-center gap-2">
              <Pencil
                aria-hidden="true"
                className="shrink-0 text-slate-400"
                size={16}
              />
              <input
                type="text"
                aria-label="Trip title"
                value={currentTripTitle}
                onChange={(event) => setTripTitle(event.target.value)}
                className="min-w-0 flex-1 bg-transparent p-0 text-xl font-semibold text-slate-950 outline-none"
              />
            </SheetTitle>
            <div className="flbx pl-6">
              <SheetDescription>
                {destination?.region}, {destination?.country}
              </SheetDescription>
              <button
                className="text-sm flx gap-2"
                onClick={handleStartNewPlan}
              >
                <Plus size={14} />
                New Plan
              </button>
            </div>
          </SheetHeader>

          {showAgent && (
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${
                      (displayedStep / (planningSteps.length - 1)) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-6 gap-1">
                {planningSteps.map((step, index) => {
                  const isReached = index <= unlockedStep;
                  const isActive = index === displayedStep;
                  const isComplete = index < displayedStep;

                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => handleStepSelect(index)}
                      disabled={!isReached}
                      className={`min-w-0 rounded-md px-1 py-1.5 text-center transition ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : isComplete
                            ? "text-slate-700 hover:bg-slate-100"
                            : "text-slate-400"
                      } ${!isReached ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <span className="block truncate text-[11px] font-medium leading-4">
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showInitialLoader && (
            <div className="center flex-1 text-sm text-slate-500">
              <Loader2 className="mr-2 animate-spin text-primary" size={18} />
              {isCheckingTrips
                ? "Checking previous trip planning..."
                : "Loading trip details..."}
            </div>
          )}

          {tripDetailError && !showInitialLoader && (
            <div className="flex-1 p-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Could not load the selected trip details. Choose another plan or
                start a new trip.
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  if (destinationTrips.length > 1) {
                    setSelectedTrip(null);
                    setIsStartingNewPlan(false);
                    return;
                  }

                  handleStartNewPlan();
                }}
              >
                {destinationTrips.length > 1
                  ? "Back to trip list"
                  : "Start a new trip"}
              </Button>
            </div>
          )}

          {showTripList && !tripDetailError && (
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 text-primary" size={18} />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Choose a plan to continue
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      I found existing plans for {destination?.name}. Continue
                      one of them or start a separate plan.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="h-11 w-full rounded-full"
                onClick={handleStartNewPlan}
              >
                <Sparkles size={17} />
                Start a new plan
              </Button>

              <div className="grid gap-3">
                {destinationTrips.map((trip) => (
                  <button
                    key={
                      getTripId(trip) ||
                      trip?.slug ||
                      getTripTitle(trip, destination)
                    }
                    type="button"
                    onClick={() => handleSelectTrip(trip)}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <p className="text-sm font-semibold text-slate-950">
                      {getTripTitle(trip, destination)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {getTripDates(trip)}
                    </p>
                    {trip?.trip_pace && (
                      <p className="mt-2 text-xs font-medium uppercase text-slate-400">
                        {trip.trip_pace}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSetupForm && !tripDetailError && (
            <TripPlanInitialInput
              destination={destination}
              form={form}
              onFieldChange={updateField}
              onSubmit={handleCreateTrip}
              isSubmitting={isCreatingTrip}
              getEndDate={getEndDate}
            />
          )}

          {showAgent && !tripDetailError && (
            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
              <ActiveStepComponent
                key={`${activeTripId}-${displayedStepConfig.key}`}
                trip={activeTrip}
                destination={destination}
                getEndDate={getEndDate}
                onTripUpdated={handleTripUpdated}
                onStepComplete={handleStepComplete}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TripPlanningDrawer;
