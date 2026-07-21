import { useState } from "react";
import {
  Ban,
  CalendarClock,
  MoreHorizontal,
  Route,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import {
  useDeleteTripMutation,
  useUpdateTripMutation,
} from "@/features/trips/tripApiSlice";
import { cn } from "@/lib/utils";

import TripPlanningDrawer from "../trip-create";
import RescheduleDialog from "./reschedule-dialog";
import ShareTripDialog from "./share-trip-dialog";

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const TripActionsDropdown = ({
  trip,
  destination,
  triggerClassName,
  contentClassName,
  onTripChange,
  onDeleted,
  showPlanning = true,
  align = "end",
  ariaLabel = "Trip actions",
}) => {
  const [shareMeta, setShareMeta] = useState(() => ({
    share_url: trip?.share_url || "",
    visibility: trip?.visibility || "",
  }));
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateTrip, { isLoading: isUpdatingTrip }] = useUpdateTripMutation();
  const [deleteTrip, { isLoading: isDeletingTrip }] = useDeleteTripMutation();
  const displayedTrip = { ...trip, ...shareMeta };
  const tripId = getTripId(displayedTrip);

  const updateShareMeta = (updates) => {
    setShareMeta((current) => ({ ...current, ...updates }));
    onTripChange?.(updates);
  };

  const handleRescheduleTrip = async (payload) => {
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    try {
      await updateTrip({ trip_id: tripId, ...payload }).unwrap();
      toast.success("Trip rescheduled.");
      setRescheduleOpen(false);
      onTripChange?.(payload);
    } catch (error) {
      toast.error(error?.data?.message || "Could not reschedule this trip.");
    }
  };

  const handleCancelTrip = async () => {
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    try {
      await updateTrip({ trip_id: tripId, status: "cancelled" }).unwrap();
      toast.success("Trip cancelled.");
      setCancelOpen(false);
      onTripChange?.({ status: "cancelled" });
    } catch (error) {
      toast.error(error?.data?.message || "Could not cancel this trip.");
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    try {
      await deleteTrip({ trip_id: tripId }).unwrap();
      toast.success("Trip deleted.");
      setDeleteOpen(false);
      onDeleted?.();
    } catch (error) {
      toast.error(error?.data?.message || "Could not delete this trip.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              triggerClassName,
            )}
            aria-label={ariaLabel}
          >
            <MoreHorizontal size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className={cn(
            "w-40 rounded-2xl border border-slate-200",
            contentClassName,
          )}
        >
          <DropdownMenuItem onSelect={() => setRescheduleOpen(true)}>
            <CalendarClock size={15} />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShareOpen(true)}>
            <Share2 size={15} />
            Share Trip
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCancelOpen(true)}>
            <Ban size={15} />
            Cancel trip
          </DropdownMenuItem>
          {showPlanning && (
            <DropdownMenuItem onSelect={() => setPlanningOpen(true)}>
              <Route size={15} />
              View Planning
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 size={15} />
            Delete trip
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RescheduleDialog
        trip={displayedTrip}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        isLoading={isUpdatingTrip}
        onSubmit={handleRescheduleTrip}
      />
      {showPlanning && (
        <TripPlanningDrawer
          trip={displayedTrip}
          destination={destination || displayedTrip.primary_destination}
          open={planningOpen}
          onOpenChange={setPlanningOpen}
        />
      )}
      <ShareTripDialog
        trip={displayedTrip}
        open={shareOpen}
        onOpenChange={setShareOpen}
        onTripChange={updateShareMeta}
      />
      <DeleteDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel trip?"
        description="This will mark the trip as cancelled. You can keep the trip record, but it will move out of active trips."
        confirmLabel="Cancel trip"
        cancelLabel="Keep trip"
        isLoading={isUpdatingTrip}
        onConfirm={handleCancelTrip}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete trip?"
        description="This permanently removes the trip plan and cannot be undone."
        confirmLabel="Delete trip"
        isLoading={isDeletingTrip}
        onConfirm={handleDeleteTrip}
      />
    </>
  );
};

export default TripActionsDropdown;
