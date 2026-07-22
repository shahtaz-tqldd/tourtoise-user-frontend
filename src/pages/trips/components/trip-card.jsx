import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/ui/status";
import { useDeleteTripMutation } from "@/features/trips/tripApiSlice";
import { formatDate, formatUpdatedAt } from "@/lib/date-time";
import { getCloudinaryPreviewUrl } from "@/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe,
  MapPin,
  MoreHorizontal,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import TripActionsDropdown from "./trip-actions-dropdown";

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

const TripCard = ({ trip, compact = false }) => {
  const [shareMeta, setShareMeta] = useState(() => ({
    share_url: trip.share_url || "",
    visibility: trip.visibility || "",
  }));
  const displayedTrip = { ...trip, ...shareMeta };
  const coverImage = getTripCoverImage(displayedTrip);
  const destinationMeta = getDestinationMeta(displayedTrip);
  const tripId = getTripId(displayedTrip);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTrip, { isLoading: isDeletingTrip }] = useDeleteTripMutation();
  const dateRange =
    displayedTrip.start_date && displayedTrip.end_date
      ? `${formatDate(displayedTrip.start_date)} - ${formatDate(displayedTrip.end_date)}`
      : formatDate(displayedTrip.start_date);

  const updateShareMeta = (updates) => {
    setShareMeta((current) => ({ ...current, ...updates }));
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
      <Link to={getTripUrl(displayedTrip)}>
        <Card className="relative border md:border-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={displayedTrip.status || "draft"} />
                {displayedTrip.visibility && (
                  <StatusBadge status={displayedTrip.visibility} />
                )}
              </div>

              <div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                  {displayedTrip.title || "Untitled trip"}
                </h3>
                <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                  <MapPin size={13} className="shrink-0 text-primary" />
                  <span className="truncate">
                    {destinationMeta || getDestinationLabel(displayedTrip)}
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
                {formatTravelers(displayedTrip)}
              </span>
            </span>
          </div>
        </Card>

        <DeleteDialog
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
    <Link to={getTripUrl(displayedTrip)}>
      <Card className="group relative md:p-5">
        <div className="grid gap-6 lg:flex">
          {/* Cover image — full-width hero strip */}
          {coverImage ? (
            <img
              src={getCloudinaryPreviewUrl(coverImage, 360)}
              alt={`${getDestinationLabel(displayedTrip)} cover`}
              className="rounded-2xl h-60 w-full md:w-80 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="rounded-2xl h-60 w-80 center bg-slate-100 text-slate-400">
              <MapPin size={28} />
            </div>
          )}
          {/* Card body */}
          <div className="flex flex-col gap-6 justify-between flex-1 w-full">
            {/* Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={displayedTrip.status || "draft"} />
                  <span className="flx gap-2 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                    {displayedTrip.visibility === "private" ? (
                      <User size={12} />
                    ) : (
                      <Globe size={12} />
                    )}
                    {displayedTrip.visibility}
                  </span>
                </div>
              </div>

              {/* Title + destination */}
              <div>
                <h2
                  className={`line-clamp-2 font-semibold text-slate-950 ${
                    compact ? "text-base" : "text-[17px]"
                  }`}
                >
                  {displayedTrip.title || "Untitled trip"}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <MapPin size={14} className="shrink-0 text-primary" />
                  <span className="truncate">
                    {destinationMeta || getDestinationLabel(displayedTrip)}
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
                <span className="truncate">
                  {formatDuration(displayedTrip)}
                </span>
              </span>
              <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                <Users size={14} className="shrink-0 text-slate-400" />
                <span className="truncate capitalize">
                  {formatTravelers(displayedTrip)}
                </span>
              </span>
              <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                <MapPin size={14} className="shrink-0 text-slate-400" />
                <span className="truncate capitalize">
                  {displayedTrip.updated_at
                    ? `Updated ${formatUpdatedAt(displayedTrip.updated_at)}`
                    : `${displayedTrip.destinations_count || 1} destination${
                        Number(displayedTrip.destinations_count || 1) === 1
                          ? ""
                          : "s"
                      }`}
                </span>
              </span>
            </div>
            <div className="flex justify-end">
              <div className="flx gap-2">
                <span className="w-full md:w-fit flx gap-2 text-sm text-primary font-semibold">
                  View Details
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <TripActionsDropdown
          trip={displayedTrip}
          onTripChange={updateShareMeta}
          triggerClassName="absolute top-4 right-4 md:top-5 md:right-5 tr"
        />
      </Card>
    </Link>
  );
};

export default TripCard;
