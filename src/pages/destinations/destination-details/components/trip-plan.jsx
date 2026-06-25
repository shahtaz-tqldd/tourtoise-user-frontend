import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { useSaveDestinationMutation } from "@/features/destination/destinationApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { Bookmark, Sparkles } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const TripPlan = ({ destination, handlePlanningOpenChange }) => {
  const [saveDestination, { isLoading: isSavingDestination }] =
    useSaveDestinationMutation();
  const isSaved = destination?.is_saved;

  const handleSaveDestination = async () => {
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
  return (
    <Card className="flex flex-col items-center bg-gradient-to-r from-red-500/5 to-purple-500/10">
      <h2 className="text-lg font-bold text-primary text-center pt-2">
        Ready to make your {destination?.name} Trip?
      </h2>
      <p className="text-center text-sm text-slate-500 mt-3 mb-6">
        Build your day by day itinerary with attractions, activities, food and
        travel tips
      </p>
      <div className="space-y-3 w-full">
        <Button
          className="md:h-12 h-11 w-full rounded-full"
          onClick={() => handlePlanningOpenChange(true)}
        >
          <Sparkles size={18} />
          Start Planning your Trip
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
              ? "Add to Bucket List"
              : "Added to Bucket List"}
        </Button>
      </div>
    </Card>
  );
};

export default TripPlan;
