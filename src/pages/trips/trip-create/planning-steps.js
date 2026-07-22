import TripPlanInitialInput from "./components/initial-input";
import ItineraryStep from "./components/itinerary-step";
import OverviewStep from "./components/overview-step";
import PreferencesStep from "./components/preferences-step";
import RecommendationsStep from "./components/recommendations-step";
import TripPreparationStep from "./components/trip-preparation-step";
import { planningStepValues } from "./planning-step-utils";

export const planningSteps = [
  {
    key: planningStepValues.getStarted,
    title: "Get Started",
    component: TripPlanInitialInput,
  },
  {
    key: planningStepValues.preference,
    title: "Preferences",
    component: PreferencesStep,
  },
  {
    key: planningStepValues.recommendation,
    title: "Recommendations",
    component: RecommendationsStep,
  },
  {
    key: planningStepValues.itinerary,
    title: "Itinerary",
    component: ItineraryStep,
  },
  {
    key: planningStepValues.preparation,
    title: "Preparation",
    component: TripPreparationStep,
  },
  {
    key: planningStepValues.overview,
    title: "Overview",
    component: OverviewStep,
  },
];
