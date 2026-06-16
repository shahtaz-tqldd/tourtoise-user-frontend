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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/ui/status";
import {
  useDeleteTripMutation,
  useUpdateTripMutation,
} from "@/features/trips/tripApiSlice";
import { formatDate, formatUpdatedAt } from "@/lib/date-time";
import {
  Ban,
  CalendarClock,
  CalendarDays,
  Clock3,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const getTripUrl = (trip) => `/trips/${trip.id}`;
const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;
const getDestinationLabel = (trip) => {
  if (trip.primary_destination?.name) return trip.primary_destination.name;
  if (trip.destinations_count) {
    return `${trip.destinations_count} destination${
      trip.destinations_count === 1 ? "" : "s"
    }`;
  }

  return "Destination pending";
};

const getDestinationMeta = (trip) =>
  [trip.primary_destination?.region, trip.primary_destination?.country]
    .filter(Boolean)
    .join(", ");

const getTripCoverImage = (trip) => trip.primary_destination?.cover_image;

const formatDuration = (trip) => {
  if (trip.duration_days) {
    return `${trip.duration_days} day${Number(trip.duration_days) === 1 ? "" : "s"}`;
  }

  if (trip.nights) {
    return `${trip.nights} night${Number(trip.nights) === 1 ? "" : "s"}`;
  }

  return "Duration pending";
};

const formatTravelers = (trip) => {
  const count = Number(trip.travelers_count || 1);
  const travelerCount = `${count} traveler${count === 1 ? "" : "s"}`;
  const travelerType = trip.traveler_type
    ? ` · ${String(trip.traveler_type).replaceAll("_", " ")}`
    : "";

  return `${travelerCount}${travelerType}`;
};

const addDays = (dateValue, days) => {
  if (!dateValue || !Number.isFinite(days)) return "";

  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
};

const getInclusiveDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();
  const dayCount = Math.round(difference / (24 * 60 * 60 * 1000)) + 1;

  return dayCount > 0 ? String(dayCount) : "";
};

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isLoading,
  onConfirm,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={isLoading}>
            Keep trip
          </Button>
        </DialogClose>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Working..." : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const RescheduleDialog = ({
  trip,
  open,
  onOpenChange,
  isLoading,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => ({
    start_date: trip.start_date || "",
    end_date: trip.end_date || "",
    days: String(trip.duration_days || trip.days || ""),
  }));

  const updateStartDate = (value) => {
    setForm((current) => ({
      ...current,
      start_date: value,
      end_date:
        value && current.days
          ? addDays(value, Number(current.days) - 1)
          : current.end_date,
    }));
  };

  const updateEndDate = (value) => {
    setForm((current) => ({
      ...current,
      end_date: value,
      days: getInclusiveDayCount(current.start_date, value) || current.days,
    }));
  };

  const updateDays = (value) => {
    setForm((current) => ({
      ...current,
      days: value,
      end_date:
        current.start_date && Number(value) > 0
          ? addDays(current.start_date, Number(value) - 1)
          : current.end_date,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      start_date: form.start_date,
      end_date: form.end_date,
      days: Number(form.days),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Reschedule trip</DialogTitle>
          <DialogDescription>
            Update the trip dates and total duration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Start date
              </span>
              <Input
                type="date"
                value={form.start_date}
                onChange={(event) => updateStartDate(event.target.value)}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                End date
              </span>
              <Input
                type="date"
                value={form.end_date}
                onChange={(event) => updateEndDate(event.target.value)}
                required
              />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Duration days
            </span>
            <Input
              type="number"
              min="1"
              value={form.days}
              onChange={(event) => updateDays(event.target.value)}
              required
            />
          </label>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TripCard = ({ trip, compact = false }) => {
  const coverImage = getTripCoverImage(trip);
  const destinationMeta = getDestinationMeta(trip);
  const tripId = getTripId(trip);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateTrip, { isLoading: isUpdatingTrip }] = useUpdateTripMutation();
  const [deleteTrip, { isLoading: isDeletingTrip }] = useDeleteTripMutation();
  const dateRange =
    trip.start_date && trip.end_date
      ? `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`
      : formatDate(trip.start_date);

  const handleRescheduleTrip = async (payload) => {
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    try {
      await updateTrip({ trip_id: tripId, ...payload }).unwrap();
      toast.success("Trip rescheduled.");
      setRescheduleOpen(false);
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
    } catch (error) {
      toast.error(error?.data?.message || "Could not delete this trip.");
    }
  };

  if (compact) {
    return (
      <Link to={getTripUrl(trip)}>
        <article className="relative rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={trip.status || "draft"} />
                {trip.visibility && <StatusBadge status={trip.visibility} />}
              </div>

              <div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                  {trip.title || "Untitled trip"}
                </h3>
                <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                  <MapPin size={13} className="shrink-0 text-primary" />
                  <span className="truncate">
                    {destinationMeta || getDestinationLabel(trip)}
                  </span>
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="-mr-2 -mt-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Trip history actions"
                >
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 size={15} />
                  Delete trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 gap-2 text-xs text-slate-600 flex flex-wrap">
            <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
              <CalendarDays size={14} className="shrink-0 text-slate-400" />
              <span className="truncate">{dateRange}</span>
            </span>

            <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
              <Users size={14} className="shrink-0 text-slate-400" />
              <span className="truncate capitalize">
                {formatTravelers(trip)}
              </span>
            </span>
          </div>
        </article>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete trip?"
          description="This permanently removes the trip plan and cannot be undone."
          confirmLabel="Delete trip"
          isLoading={isDeletingTrip}
          onConfirm={handleDeleteTrip}
        />
      </Link>
    );
  }

  return (
    <>
      <article className="group overflow-hidden rounded-2xl md:rounded-[28px] md:border border-slate-200 bg-white relative">
        <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Card body */}
          <div className="flex flex-col gap-6 justify-between">
            {/* Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={trip.status || "draft"} />
                  {trip.visibility && (
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                      {trip.visibility}
                    </span>
                  )}
                </div>
              </div>

              {/* Title + destination */}
              <div>
                <h2
                  className={`line-clamp-2 font-semibold text-slate-950 ${
                    compact ? "text-base" : "text-[17px]"
                  }`}
                >
                  {trip.title || "Untitled trip"}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <MapPin size={14} className="shrink-0 text-primary" />
                  <span className="truncate">
                    {destinationMeta || getDestinationLabel(trip)}
                  </span>
                </p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays size={15} className="shrink-0 text-slate-400" />
                <span className="truncate">{dateRange}</span>
              </div>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                <Clock3 size={14} className="shrink-0 text-slate-400" />
                <span className="truncate">{formatDuration(trip)}</span>
              </span>
              <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                <Users size={14} className="shrink-0 text-slate-400" />
                <span className="truncate capitalize">
                  {formatTravelers(trip)}
                </span>
              </span>
            </div>
          </div>

          {/* Cover image — full-width hero strip */}
          {coverImage ? (
            <img
              src={coverImage}
              alt={`${getDestinationLabel(trip)} cover`}
              className="rounded-2xl h-48 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="rounded-2xl h-48 w-full center bg-slate-100 text-slate-400">
              <MapPin size={28} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 md:px-6 py-3">
          <p className="text-xs text-slate-400">
            {trip.updated_at
              ? `Updated ${formatUpdatedAt(trip.updated_at)}`
              : `${trip.destinations_count || 1} destination${
                  Number(trip.destinations_count || 1) === 1 ? "" : "s"
                }`}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={getTripUrl(trip)}>Share Trip</Link>
            </Button>
            <Button>
              <Link to={getTripUrl(trip)}>View details</Link>
            </Button>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-slate-500 bg-white/50 backdrop-blur-sm hover:bg-white/75 hover:text-slate-900 absolute top-4 md:top-6 right-4 md:right-6 tr"
              aria-label="Trip actions"
            >
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onSelect={() => setRescheduleOpen(true)}>
              <CalendarClock size={15} />
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setCancelOpen(true)}>
              <Ban size={15} />
              Cancel trip
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil size={15} />
              Update trip
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 size={15} />
              Delete trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </article>
      <RescheduleDialog
        trip={trip}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        isLoading={isUpdatingTrip}
        onSubmit={handleRescheduleTrip}
      />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel trip?"
        description="This will mark the trip as cancelled. You can keep the trip record, but it will move out of active trips."
        confirmLabel="Cancel trip"
        isLoading={isUpdatingTrip}
        onConfirm={handleCancelTrip}
      />
      <ConfirmDialog
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

export default TripCard;
