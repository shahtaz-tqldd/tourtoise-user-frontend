import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSaveDestinationListQuery,
  useSaveDestinationMutation,
} from "@/features/destination/destinationApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { PageTitle } from "@/components/shared/utils";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import DestinationCard from "../components/destination-card";

const getSavedDestinationRows = (response) => {
  const payload = response?.data || response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getDestinationFromSavedRow = (row) =>
  row?.destination || row?.destination_detail || row?.destination_data || row;

const SavedDestinationPage = () => {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const { data, isFetching, isError } = useSaveDestinationListQuery({
    page: 1,
    pageSize: 12,
  });
  const [saveDestination, { isLoading: isSaving }] =
    useSaveDestinationMutation();

  const savedDestinations = useMemo(
    () =>
      getSavedDestinationRows(data)
        .map(getDestinationFromSavedRow)
        .filter((destination) => destination?.slug),
    [data],
  );

  const handleUnsave = async () => {
    if (!selectedDestination?.slug) return;

    try {
      await saveDestination({
        destination_slug: selectedDestination.slug,
        save: false,
      }).unwrap();
      toast.success("Destination removed from saved list.");
      setSelectedDestination(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not unsave this destination."),
      );
    }
  };

  return (
    <div className="space-y-8 py-5">
      <PageTitle
        title="Saved Destination"
        text="Manage your saved destination for planning the tours you thought of"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {savedDestinations.map((destination) => (
          <DestinationCard
            key={destination.slug}
            destination={destination}
            savedActionLabel="Saved"
            onSavedClick={() => setSelectedDestination(destination)}
          />
        ))}
      </div>

      {isFetching && (
        <div className="center min-h-[260px] rounded-lg border border-slate-200 bg-white text-primary">
          <Loader2 className="mr-2 animate-spin" size={22} />
          Loading saved destinations...
        </div>
      )}

      {isError && !isFetching && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-red-900">
            Could not load saved destinations
          </h2>
          <p className="mt-1 text-sm text-red-700">
            Please try again after a moment.
          </p>
        </div>
      )}

      {!isFetching && !isError && !savedDestinations.length && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            No saved destinations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Saved destinations will appear here.
          </p>
        </div>
      )}

      <Dialog
        open={Boolean(selectedDestination)}
        onOpenChange={(open) => {
          if (!open) setSelectedDestination(null);
        }}
      >
        <DialogContent className="sm:max-w-[468px]">
          <DialogHeader>
            <DialogTitle>Unsave destination?</DialogTitle>
            <DialogDescription className="mt-2">
              {selectedDestination?.name
                ? `${selectedDestination.name} will be removed from your saved destinations.`
                : "This destination will be removed from your saved destinations."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="w-28"
              disabled={isSaving}
              onClick={handleUnsave}
            >
              {isSaving ? "Saving..." : "Unsave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedDestinationPage;
