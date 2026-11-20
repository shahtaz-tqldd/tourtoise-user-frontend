import React from "react";
import { toast } from "sonner";

// components
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// icons
import { Bookmark, Sparkles } from "lucide-react";

// lib
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useSaveDestinationMutation } from "@/features/destination/destinationApiSlice";
import { useAuthGate } from "@/features/auth/auth-gate-context";

const TripPlan = ({ destination, handlePlanningOpenChange }) => {
  const [saveDestination, { isLoading: isSavingDestination }] =
    useSaveDestinationMutation();
  const { requireAuth, isAuthenticated } = useAuthGate();
  const isSaved = isAuthenticated && destination?.is_saved;

  const saveDestinationNow = async () => {
    if (!destination?.slug) {
      toast.error("Destination slug is missing.");
      return;
    }

    const nextSavedState = !isSaved;

    try {
      await saveDestination({
        destination_slug: destination.slug,
        save: nextSavedState,
      }).unwrap();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          nextSavedState
            ? "Could not save this destination."
            : "Could not unsave this destination.",
        ),
      );
    }
  };
  const handleSaveDestination = () =>
    requireAuth(saveDestinationNow, { reason: "save" });

  const handleStartPlanning = () =>
    requireAuth(() => handlePlanningOpenChange(true), { reason: "plan" });

  return (
    <Card className="flex flex-col items-center border border-primary/15 bg-brand-mist">
      <span className="center size-11 rounded-2xl bg-primary text-white shadow-brand">
        <Sparkles size={20} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-center font-display text-h4 text-heading">
        Ready for your {destination?.name} trip?
      </h2>
      <p className="mb-6 mt-2 text-center text-body-sm text-subtle">
        Turtle, our AI travel agent, builds a day-by-day itinerary with
        attractions, food and tips — then guides you on the road.
      </p>
      <div className="space-y-3 w-full">
        <Button
          className="md:h-12 h-11 w-full rounded-full font-semibold"
          onClick={handleStartPlanning}
        >
          <Sparkles size={18} />
          {isAuthenticated ? "Plan this trip with Turtle" : "Sign in to plan with Turtle"}
        </Button>
        <Button
          variant="outline"
          className="md:h-12 h-11 w-full rounded-full"
          disabled={isSavingDestination}
          onClick={handleSaveDestination}
        >
          <Bookmark
            size={18}
            className={isSaved ? "fill-primary text-primary" : ""}
          />
          {isSavingDestination
            ? "Saving..."
            : isSaved
              ? "Added into Bucket List"
              : "Add to Bucket List"}
        </Button>
      </div>
    </Card>
  );
};

export default TripPlan;
