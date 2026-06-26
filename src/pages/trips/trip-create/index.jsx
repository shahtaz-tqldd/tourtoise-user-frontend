import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ellipsis,
  List,
  Pencil,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useCreateTripMutation,
  useDeleteTripMutation,
  useTripDetailQuery,
  useTripListQuery,
} from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

// components
import TripPlanInitialInput from "./components/initial-input";
import PreferencesStep from "./components/preferences-step";
import RecommendationsStep from "./components/recommendations-step";
import ItineraryStep from "./components/itinerary-step";
import TripPreparationStep from "./components/trip-preparation-step";
import OverviewStep from "./components/overview-step";

const createInitialForm = () => ({
  budget_tier: "mid",
  budget_currency: "",
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
    key: "get_started",
    title: "Get Started",
    description: "Initial info taking",
    component: TripPlanInitialInput,
  },
  {
    key: "preferences",
    title: "Preferences",
    description: "User profile and customization",
    component: PreferencesStep,
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
    key: "preparation",
    title: "Preparation",
    description: "Documents and packup",
    component: TripPreparationStep,
  },
  {
    key: "overview",
    title: "Overview",
    description: "Overview and locking up",
    component: OverviewStep,
  },
];

const currentStepAliases = {
  get_started: "get_started",
  preferences: "preferences",
  recommendations: "recommendations",
  itinerary: "itinerary",
  preparation: "preparation",
  overview: "overview",
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
  const [isViewingPlanList, setIsViewingPlanList] = useState(false);
  const [tripTitle, setTripTitle] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [furthestStep, setFurthestStep] = useState(0);
  const generatedTripTitle = useMemo(
    () => getGeneratedTripTitle(destinationName),
    [destinationName],
  );
  const currentTripTitle = tripTitle ?? generatedTripTitle;

  const {
    data: tripListData,
    isFetching: isCheckingTrips,
    refetch: refetchTripList,
  } = useTripListQuery(
    open && destinationSlug
      ? { destination_slug: destinationSlug, page: 1, page_size: 20 }
      : skipToken,
  );
  const [createTrip, { isLoading: isCreatingTrip }] = useCreateTripMutation();
  const [deleteTrip, { isLoading: isDeletingTrip }] = useDeleteTripMutation();

  const destinationTrips = useMemo(
    () => unwrapList(tripListData),
    [tripListData],
  );
  const previousTrip = destinationTrips[0] || null;
  const shouldLoadSingleTrip =
    destinationTrips.length === 1 &&
    !isStartingNewPlan &&
    !isViewingPlanList &&
    !createdTrip;
  const detailSourceTrip =
    !isCheckingTrips && !createdTrip && !isStartingNewPlan && !isViewingPlanList
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
  const activeTrip =
    isStartingNewPlan || isViewingPlanList
      ? null
      : createdTrip || detailedTrip || null;
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
      !form.budget_tier ||
      !form.travelers_count ||
      !form.traveler_type ||
      !form.start_location_address
    ) {
      toast.error("Fill in the trip basics before starting the plan.");
      return;
    }

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
    setIsViewingPlanList(false);
    setTripTitle(null);
    setForm(createInitialForm());
    setActiveStep(null);
    setFurthestStep(0);
  };

  const handleViewPlanList = () => {
    setCreatedTrip(null);
    setSelectedTrip(null);
    setIsStartingNewPlan(false);
    setIsViewingPlanList(true);
    setTripTitle(null);
    setActiveStep(null);
    setFurthestStep(0);
  };

  const handleSelectTrip = (trip) => {
    const currentStep = getCurrentStepIndex(trip);

    setCreatedTrip(null);
    setSelectedTrip(trip);
    setIsStartingNewPlan(false);
    setIsViewingPlanList(false);
    setTripTitle(getTripTitle(trip, destination));
    setActiveStep(currentStep);
    setFurthestStep(currentStep);
  };

  const handleDeleteActiveTrip = async () => {
    if (!activeTripId) {
      toast.error("No active trip selected.");
      return;
    }

    try {
      await deleteTrip({ trip_id: activeTripId }).unwrap();
      toast.success("Trip plan deleted.");
      setCreatedTrip(null);
      setSelectedTrip(null);
      setIsStartingNewPlan(false);
      setIsViewingPlanList(true);
      setTripTitle(null);
      setActiveStep(null);
      setFurthestStep(0);
      refetchTripList?.();
    } catch (error) {
      toast.error(error?.data?.message || "Could not delete this trip plan.");
    }
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
    (isViewingPlanList ||
      (!isStartingNewPlan &&
        !selectedTrip &&
        !createdTrip &&
        destinationTrips.length > 1));
  const showSetupForm =
    !isCheckingTrips &&
    !isFetchingTripDetail &&
    !isViewingPlanList &&
    (isStartingNewPlan || (!destinationTrips.length && !activeTrip));
  const showAgent =
    !!activeTrip &&
    !isStartingNewPlan &&
    !isViewingPlanList &&
    !isFetchingTripDetail;
  const showInitialLoader =
    isCheckingTrips ||
    (!isStartingNewPlan &&
      !isViewingPlanList &&
      !!detailTripId &&
      isFetchingTripDetail);
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setCreatedTrip(null);
      setSelectedTrip(null);
      setIsStartingNewPlan(false);
      setIsViewingPlanList(false);
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
        side="bottom"
        className="h-dvh w-full max-w-full overflow-hidden p-0 md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:h-screen md:w-screen md:-translate-x-1/2 md:-translate-y-1/2 md:border md:border-slate-200"
      >
        <div className="flex h-full flex-col max-w-xl w-full mx-auto bg-white">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Trip plan actions"
                    className="center size-9 shrink-0 rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 translate-x-12"
                  >
                    <Ellipsis size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl border-slate-200 p-1 shadow-lg"
                >
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2"
                    onSelect={handleStartNewPlan}
                  >
                    <Plus size={16} />
                    Add new plan
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2"
                    onSelect={handleViewPlanList}
                  >
                    <List size={16} />
                    See previous plans
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={!activeTripId || isDeletingTrip}
                    className="rounded-lg px-3 py-2"
                    onSelect={(event) => {
                      event.preventDefault();
                      handleDeleteActiveTrip();
                    }}
                  >
                    {isDeletingTrip ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete this plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SheetTitle>
            <div className="flbx pl-6">
              <SheetDescription>
                {destination?.region}, {destination?.country}
              </SheetDescription>
            </div>
          </SheetHeader>

          {showAgent && (
            <div className="border-slate-200 px-4 py-3 border-b">
              <div className="flex">
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
                      className={`min-w-0 flex-1 rounded-md px-1 py-1.5 text-center transition ${
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
                {destinationTrips.length ? (
                  destinationTrips.map((trip) => (
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
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No previous plans found for this destination.
                  </div>
                )}
              </div>
            </div>
          )}

          {showSetupForm && !tripDetailError && (
            <div className="flex min-h-0 flex-1 flex-col">
              <TripPlanInitialInput
                destination={destination}
                form={form}
                onFieldChange={updateField}
                onSubmit={handleCreateTrip}
                isSubmitting={isCreatingTrip}
                getEndDate={getEndDate}
                onClose={() => handleOpenChange(false)}
              />
            </div>
          )}

          {showAgent && !tripDetailError && (
            <div
              className={
                [
                  "get_started",
                  "preferences",
                  "recommendations",
                  "itinerary",
                  "preparation",
                  "overview",
                ].includes(displayedStepConfig.key)
                  ? "min-h-0 flex-1"
                  : "custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4"
              }
            >
              <ActiveStepComponent
                key={`${activeTripId}-${displayedStepConfig.key}`}
                trip={activeTrip}
                destination={destination}
                getEndDate={getEndDate}
                onTripUpdated={handleTripUpdated}
                onStepComplete={handleStepComplete}
                onStepSelect={handleStepSelect}
                onClose={() => handleOpenChange(false)}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TripPlanningDrawer;
