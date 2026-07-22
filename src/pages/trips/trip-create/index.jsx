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
  useTripListQuery,
  useTripShortDetailsQuery,
} from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// components
import TripPlanInitialInput from "./components/initial-input";
import PlanningStepRail from "./components/planning-step-rail";
import { formatDate } from "@/lib/date-time";
import {
  canOpenStep,
  getCurrentPlanningStepIndex,
  getPayloadCurrentStep,
  planningStepValues,
} from "./planning-step-utils";
import { planningSteps } from "./planning-steps";
import {
  createInitialTripForm,
  getDestinationSlug,
  getEndDate,
  getGeneratedTripTitle,
  getTripDetailId,
  getTripId,
  getTripTitle,
  unwrapApiData,
} from "./trip-planning-utils";

const getCurrentStepIndex = (trip) =>
  getCurrentPlanningStepIndex(trip?.current_step);

const TripPlanningDrawer = ({ destination, trip, open, onOpenChange }) => {
  const resolvedDestination =
    destination || trip?.primary_destination || trip?.destination || null;
  const destinationSlug = getDestinationSlug(resolvedDestination);
  const destinationName = resolvedDestination?.name || "";
  const directTripId = getTripDetailId(trip);
  const shouldSkipTripList = Boolean(trip);
  const [form, setForm] = useState(createInitialTripForm);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isStartingNewPlan, setIsStartingNewPlan] = useState(false);
  const [isViewingPlanList, setIsViewingPlanList] = useState(false);
  const [tripTitle, setTripTitle] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [furthestStep, setFurthestStep] = useState(0);
  const [planningState, setPlanningState] = useState(null);
  const generatedTripTitle = useMemo(
    () => getGeneratedTripTitle(destinationName),
    [destinationName],
  );

  const {
    data: tripListData,
    isFetching: isCheckingTrips,
    refetch: refetchTripList,
  } = useTripListQuery(
    open && destinationSlug && !shouldSkipTripList
      ? { destination_slug: destinationSlug, page: 1, page_size: 20 }
      : skipToken,
  );
  const [createTrip, { isLoading: isCreatingTrip }] = useCreateTripMutation();
  const [deleteTrip, { isLoading: isDeletingTrip }] = useDeleteTripMutation();

  const destinationTrips = useMemo(
    () => (Array.isArray(tripListData?.data) ? tripListData.data : []),
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
      ? trip || selectedTrip || (shouldLoadSingleTrip ? previousTrip : null)
      : null;
  const detailTripId = directTripId || getTripDetailId(detailSourceTrip);
  const {
    data: tripDetailData,
    isFetching: isFetchingTripDetail,
    isError: tripDetailError,
  } = useTripShortDetailsQuery(
    open && detailTripId ? { trip_id: detailTripId } : skipToken,
  );
  const detailedTrip = useMemo(
    () => unwrapApiData(tripDetailData, null),
    [tripDetailData],
  );
  const loadedDetailTrip =
    detailTripId && getTripDetailId(detailedTrip) === detailTripId
      ? detailedTrip
      : null;
  const selectedActiveTrip = selectedTrip
    ? { ...(loadedDetailTrip || {}), ...selectedTrip }
    : null;
  const activeTrip =
    isStartingNewPlan || isViewingPlanList
      ? null
      : createdTrip || selectedActiveTrip || loadedDetailTrip || trip || null;
  const currentTripTitle =
    tripTitle ??
    getTripTitle(activeTrip || trip, resolvedDestination) ??
    generatedTripTitle;
  const serverCurrentStep = getPayloadCurrentStep(
    planningState,
    activeTrip?.current_step,
  );
  const tripCurrentStep = activeTrip
    ? getCurrentPlanningStepIndex(serverCurrentStep)
    : 0;
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
      setPlanningState(null);
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
    setForm(createInitialTripForm());
    setActiveStep(null);
    setFurthestStep(0);
    setPlanningState(null);
  };

  const handleViewPlanList = () => {
    setCreatedTrip(null);
    setSelectedTrip(null);
    setIsStartingNewPlan(false);
    setIsViewingPlanList(true);
    setTripTitle(null);
    setActiveStep(null);
    setFurthestStep(0);
    setPlanningState(null);
  };

  const handleSelectTrip = (trip) => {
    const currentStep = getCurrentStepIndex(trip);

    setCreatedTrip(null);
    setSelectedTrip(trip);
    setIsStartingNewPlan(false);
    setIsViewingPlanList(false);
    setTripTitle(getTripTitle(trip, resolvedDestination));
    setActiveStep(currentStep);
    setFurthestStep(currentStep);
    setPlanningState(null);
  };

  const handleDeleteActiveTrip = async () => {
    if (!activeTripId) {
      toast.error("No active trip selected.");
      return;
    }

    try {
      await deleteTrip({ trip_id: activeTripId }).unwrap();
      toast.success("Trip plan deleted.");

      if (shouldSkipTripList) {
        handleOpenChange(false);
        return;
      }

      setCreatedTrip(null);
      setSelectedTrip(null);
      setIsStartingNewPlan(false);
      setIsViewingPlanList(true);
      setTripTitle(null);
      setActiveStep(null);
      setFurthestStep(0);
      setPlanningState(null);
      refetchTripList?.();
    } catch (error) {
      toast.error(error?.data?.message || "Could not delete this trip plan.");
    }
  };

  const handleStepSelect = (stepIndex) => {
    const step = planningSteps[stepIndex];
    const isAvailable = planningState?.flow?.length
      ? canOpenStep({ trip: activeTrip, payload: planningState, stepKey: step.key })
      : stepIndex <= unlockedStep;

    if (!isAvailable) return;
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

  const handlePlanningStateChange = useCallback((payload) => {
    if (!payload) return;

    setPlanningState(payload);
    const currentStep = getCurrentPlanningStepIndex(
      getPayloadCurrentStep(payload),
    );
    setFurthestStep((previous) => Math.max(previous, currentStep));
  }, []);

  const showTripList =
    !shouldSkipTripList &&
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
      setForm(createInitialTripForm());
      setTripTitle(null);
      setActiveStep(null);
      setFurthestStep(0);
      setPlanningState(null);
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
              {!shouldSkipTripList && (
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
              )}
            </SheetTitle>
            <div className="flbx pl-6">
              <SheetDescription>
                {[resolvedDestination?.region, resolvedDestination?.country]
                  .filter(Boolean)
                  .join(", ")}
              </SheetDescription>
            </div>
          </SheetHeader>

          {showAgent && (
            <PlanningStepRail
              steps={planningSteps}
              activeStep={displayedStep}
              unlockedStep={unlockedStep}
              trip={activeTrip}
              planningState={planningState}
              onStepSelect={handleStepSelect}
            />
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
                      I found existing plans for {resolvedDestination?.name}.
                      Continue one of them or start a separate plan.
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
                        getTripTitle(trip, resolvedDestination)
                      }
                      type="button"
                      onClick={() => handleSelectTrip(trip)}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {getTripTitle(trip, resolvedDestination)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(trip?.start_date)} -
                        {formatDate(trip?.end_date)}
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
                destination={resolvedDestination}
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
                  planningStepValues.preference,
                  planningStepValues.recommendation,
                  planningStepValues.itinerary,
                  planningStepValues.preparation,
                  planningStepValues.overview,
                ].includes(displayedStepConfig.key)
                  ? "min-h-0 flex-1"
                  : "custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4"
              }
            >
              <ActiveStepComponent
                key={`${activeTripId}-${displayedStepConfig.key}`}
                trip={activeTrip}
                destination={resolvedDestination}
                getEndDate={getEndDate}
                onTripUpdated={handleTripUpdated}
                onStepComplete={handleStepComplete}
                onStepSelect={handleStepSelect}
                onPlanningStateChange={handlePlanningStateChange}
                onStartNewPlan={handleStartNewPlan}
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
