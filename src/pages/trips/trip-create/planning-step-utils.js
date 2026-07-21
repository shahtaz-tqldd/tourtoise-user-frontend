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
