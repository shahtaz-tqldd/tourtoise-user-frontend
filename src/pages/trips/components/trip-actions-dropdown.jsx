import { useEffect, useRef, useState } from "react";
import {
  Ban,
  CalendarClock,
  MoreHorizontal,
  Route,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import PreviewDropdown from "@/components/shared/preview-dropdown";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import {
  useDeleteTripMutation,
  useUpdateTripMutation,
} from "@/features/trips/tripApiSlice";
import { useMediaQuery } from "@/lib/mobile-visible";
import { cn } from "@/lib/utils";

import TripPlanningDrawer from "../trip-create";
import RescheduleDialog from "./reschedule-dialog";
import ShareTripDialog from "./share-trip-dialog";

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const ActionButton = ({ icon, children, destructive, onClick }) => (
  <button
    type="button"
    className={cn(
      "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
      destructive
        ? "text-destructive hover:bg-destructive/10"
        : "text-slate-700",
    )}
    onClick={onClick}
  >
    {icon}
    {children}
  </button>
);

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
  const isMobile = useMediaQuery();
  const [open, setOpen] = useState(false);
  const actionTimerRef = useRef(null);
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

  const openAction = (setActionOpen) => {
    setOpen(false);

    if (actionTimerRef.current) {
      window.clearTimeout(actionTimerRef.current);
    }

    if (!isMobile) {
      setActionOpen(true);
      return;
    }

    // Let the action sheet release its focus lock and history entry before the
    // next sheet opens.
    actionTimerRef.current = window.setTimeout(() => {
      setActionOpen(true);
      actionTimerRef.current = null;
    }, 300);
  };

  useEffect(
    () => () => {
      if (actionTimerRef.current) {
        window.clearTimeout(actionTimerRef.current);
      }
    },
    [],
  );

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
      <PreviewDropdown
        open={open}
        onOpenChange={setOpen}
        title="Trip actions"
        description="Choose an action for this trip."
        align={align}
        desktopClassName={cn("w-44", contentClassName)}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 !border-none !shadow-none",
              triggerClassName,
            )}
            aria-label={ariaLabel}
          >
            <MoreHorizontal size={18} />
          </Button>
        }
      >
        <div className="border-b border-slate-100 px-4 pb-4 pt-2 md:hidden">
          <h2 className="font-bold text-slate-950">Trip actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose an action for this trip.
          </p>
        </div>
        <div className="space-y-1 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <ActionButton
            icon={<CalendarClock size={16} className="shrink-0" />}
            onClick={() => openAction(setRescheduleOpen)}
          >
            Reschedule
          </ActionButton>
          <ActionButton
            icon={<Share2 size={16} className="shrink-0" />}
            onClick={() => openAction(setShareOpen)}
          >
            Share Trip
          </ActionButton>
          <ActionButton
            icon={<Ban size={16} className="shrink-0" />}
            onClick={() => openAction(setCancelOpen)}
          >
            Cancel trip
          </ActionButton>
          {showPlanning && (
            <ActionButton
              icon={<Route size={16} className="shrink-0" />}
              onClick={() => openAction(setPlanningOpen)}
            >
              View Planning
            </ActionButton>
          )}
          <ActionButton
            icon={<Trash2 size={16} className="shrink-0" />}
            destructive
            onClick={() => openAction(setDeleteOpen)}
          >
            Delete trip
          </ActionButton>
        </div>
      </PreviewDropdown>

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
