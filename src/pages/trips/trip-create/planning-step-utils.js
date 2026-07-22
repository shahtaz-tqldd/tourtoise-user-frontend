export const planningStepValues = {
  getStarted: "get_started",
  preference: "preference",
  recommendation: "recommendation",
  itinerary: "itinerary",
  preparation: "preparation",
  overview: "overview",
  completed: "completed",
};

export const planningStepOrder = [
  planningStepValues.getStarted,
  planningStepValues.preference,
  planningStepValues.recommendation,
  planningStepValues.itinerary,
  planningStepValues.preparation,
  planningStepValues.overview,
];

const currentStepAliases = {
  get_started: planningStepValues.getStarted,
  preference: planningStepValues.preference,
  preferences: planningStepValues.preference,
  recommendation: planningStepValues.recommendation,
  recommendations: planningStepValues.recommendation,
  itinerary: planningStepValues.itinerary,
  itineraries: planningStepValues.itinerary,
  preparation: planningStepValues.preparation,
  preparations: planningStepValues.preparation,
  overview: planningStepValues.overview,
  completed: planningStepValues.completed,
};

export const normalizeStepValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getCurrentPlanningStepKey = (currentStep) => {
  const numericStep = Number(currentStep);

  if (Number.isInteger(numericStep)) {
    const oneBasedIndex = numericStep - 1;
    if (oneBasedIndex >= 0 && oneBasedIndex < planningStepOrder.length) {
      return planningStepOrder[oneBasedIndex];
    }

    if (numericStep >= 0 && numericStep < planningStepOrder.length) {
      return planningStepOrder[numericStep];
    }
  }

  const stepKey = currentStepAliases[normalizeStepValue(currentStep)];
  return stepKey || planningStepValues.getStarted;
};

export const getCurrentPlanningStepIndex = (currentStep) => {
  const stepKey = getCurrentPlanningStepKey(currentStep);

  if (stepKey === planningStepValues.completed) {
    return planningStepOrder.length - 1;
  }

  const stepIndex = planningStepOrder.indexOf(stepKey);
  return stepIndex >= 0 ? stepIndex : 0;
};

export const isPlanningStepAfter = (currentStep, stepKey) =>
  getCurrentPlanningStepIndex(currentStep) >
  getCurrentPlanningStepIndex(stepKey);

export const isPlanningStepAtOrAfter = (currentStep, stepKey) =>
  getCurrentPlanningStepIndex(currentStep) >=
  getCurrentPlanningStepIndex(stepKey);

const completionFields = {
  [planningStepValues.preference]: "is_qna_complete",
  [planningStepValues.recommendation]: "is_recommendation_complete",
  [planningStepValues.itinerary]: "is_itinerary_design_complete",
  [planningStepValues.preparation]: "is_trip_preparation_complete",
};

export const getPlanningProgress = (payload) =>
  payload?.progress || payload?.planning_progress || {};

export const getPlanningFlow = (payload) =>
  Array.isArray(payload?.flow) ? payload.flow : [];

export const getFlowStep = (payload, stepKey) =>
  getPlanningFlow(payload).find(
    (item) => getCurrentPlanningStepKey(item.step) === stepKey,
  );

export const getPayloadCurrentStep = (payload, fallback) =>
  getPlanningProgress(payload)?.current_step || fallback;

export const isStepComplete = ({ trip, payload, stepKey }) => {
  if (stepKey === planningStepValues.getStarted) return Boolean(trip);
  if (trip?.current_step === planningStepValues.completed) return true;

  const flowStep = getFlowStep(payload, stepKey);
  if (typeof flowStep?.is_complete === "boolean") return flowStep.is_complete;

  const field = completionFields[stepKey];
  const progress = getPlanningProgress(payload);
  const stats = trip?.planning_stats || {};

  if (field && (payload?.[field] || progress[field] || stats[field])) return true;

  return (
    getCurrentPlanningStepIndex(
      getPayloadCurrentStep(payload, trip?.current_step),
    ) > getCurrentPlanningStepIndex(stepKey)
  );
};

export const canOpenStep = ({ trip, payload, stepKey }) => {
  if (stepKey === planningStepValues.getStarted) return true;

  const flowStep = getFlowStep(payload, stepKey);
  if (typeof flowStep?.can_open === "boolean") return flowStep.can_open;

  return (
    getCurrentPlanningStepIndex(stepKey) <=
    getCurrentPlanningStepIndex(
      getPayloadCurrentStep(payload, trip?.current_step),
    )
  );
};
