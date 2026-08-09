import { Image, VisibilityStatus } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status";
import { formatDateRange, formatUpdatedAt } from "@/lib/date-time";
import {
  Bell,
  CalendarDays,
  Dot,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

const getTripUrl = (trip) => `/trips/${trip.id}`;
const getDestinationLabel = (trip) => {
  if (trip?.primary_destination?.name) return trip?.primary_destination?.name;
  if (trip?.destinations_count) {
    return `${trip?.destinations_count} destination${
      trip?.destinations_count === 1 ? "" : "s"
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
  const displayedTrip = { ...trip };
  const coverImage = getTripCoverImage(displayedTrip);
  const destinationMeta = getDestinationMeta(displayedTrip);
  const notificationUnreadCount = trip.unread_notification || 0;
  const messageUnreadCount = trip.unread_message || 0;

  if (compact) {
    return (
      <Link to={getTripUrl(displayedTrip)}>
        <Card className="relative border md:border-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={displayedTrip?.status} />
                <VisibilityStatus visibility={displayedTrip?.visibility} />
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
          </div>

          <div className="mt-4 gap-2 text-xs text-slate-600 flex flex-wrap">
            <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
              <CalendarDays size={14} className="shrink-0 text-slate-400" />
              <span className="truncate">
                {formatDateRange(
                  displayedTrip.start_date,
                  displayedTrip.end_date,
                )}
              </span>
            </span>

            <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
              <Users size={14} className="shrink-0 text-slate-400" />
              <span className="truncate capitalize">
                {formatTravelers(displayedTrip)}
              </span>
            </span>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={getTripUrl(displayedTrip)}>
      <div className="group flex md:flex-row flex-col bg-white rounded-3xl overflow-hidden">
        {/* Cover image — full-width hero strip */}
        <div className="h-56 w-full shrink-0 overflow-hidden md:h-auto md:w-92 md:self-stretch">
          <Image
            src={coverImage}
            alt={`${getDestinationLabel(displayedTrip)} cover`}
          />
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-6 justify-between flex-1 w-full p-4 md:p-5">
          {/* Badges */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={displayedTrip.status || "draft"} />
                <VisibilityStatus visibility={displayedTrip?.visibility} />
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
              {formatDateRange(
                displayedTrip.start_date,
                displayedTrip.end_date,
              )}
              <Dot />
              <span className="truncate">{formatDuration(displayedTrip)}</span>
            </div>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-2">
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
          <div className="flbx">
            <div className="flx gap-6">
              {notificationUnreadCount ? (
                <div className="flx gap-1.5">
                  <Bell size={16} className="text-red-600" />
                  <span className="text-xs font-medium text-red-600">
                    {notificationUnreadCount} Alert
                  </span>
                </div>
              ) : null}
              {messageUnreadCount ? (
                <div className="flx gap-1.5">
                  <MessageCircle size={16} className="text-red-600" />
                  <span className="text-xs font-medium text-red-600">
                    {messageUnreadCount} Message
                  </span>
                </div>
              ) : null}
            </div>
            <div className="flx gap-2">
              <Button
                size="sm"
                className="rounded-full px-4 text-xs font-semibold"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
