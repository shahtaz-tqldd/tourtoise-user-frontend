import React, { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  MapPin,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status";
import { Link } from "react-router-dom";

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const formatShortDate = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const formatDateRange = (startDate, endDate) => {
  if (startDate && endDate) {
    return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
  }

  return formatShortDate(startDate || endDate) || "Dates not set";
};

const SummaryMetric = ({ icon, label, value }) => (
  <div className="flx gap-2 rounded-xl border border-slate-200 p-4">
    <div className="center h-8 w-8 rounded-lg bg-primary/10">
      {React.createElement(icon, { className: "text-primary", size: 16 })}
    </div>
    <div className="flex-1">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  </div>
);

const DestinationSlider = ({
  destinations = [],
  tripStartDate,
  tripEndDate,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const hasMultipleDestinations = destinations.length > 1;
  const activeDestination = destinations[activeIndex];

  const goToDestination = (nextIndex) => {
    const lastIndex = destinations.length - 1;

    if (nextIndex < 0) {
      setActiveIndex(lastIndex);
      return;
    }

    if (nextIndex > lastIndex) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(nextIndex);
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null || !hasMultipleDestinations) return;

    const touchEnd = event.changedTouches[0].clientX;
    const swipeDistance = touchStart - touchEnd;

    if (Math.abs(swipeDistance) > 40) {
      goToDestination(activeIndex + (swipeDistance > 0 ? 1 : -1));
    }

    setTouchStart(null);
  };

  if (!activeDestination) return null;

  const destinationLocation = [
    activeDestination.region,
    activeDestination.country,
  ]
    .filter(Boolean)
    .join(", ");
  const destinationTags = (activeDestination.tags || [])
    .map((tag) => (typeof tag === "string" ? tag : tag?.name))
    .filter(Boolean);
  const destinationDescription =
    activeDestination.tagline || activeDestination.summary;
  const destinationDateRange = formatDateRange(
    activeDestination.arrival_date || tripStartDate,
    activeDestination.departure_date || tripEndDate,
  );

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Destinations</h2>
          <p className="mt-1 text-sm text-slate-500">
            {destinations.length} destination
            {destinations.length === 1 ? "" : "s"} added to this plan.
          </p>
        </div>

        {hasMultipleDestinations && (
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => goToDestination(activeIndex - 1)}
              aria-label="Previous destination"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => goToDestination(activeIndex + 1)}
              aria-label="Next destination"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      <article
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-56 p-4">
            {activeDestination.image_url ? (
              <img
                src={activeDestination.image_url}
                alt={activeDestination.name}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <div className="center h-full w-full rounded-lg bg-primary/10 text-primary">
                <MapPin size={28} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-5 bg-white p-4 md:pl-2">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-2xl font-bold text-slate-950">
                    {activeDestination.name}
                  </h3>
                  {destinationLocation && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin size={15} className="shrink-0" />
                      <span className="truncate">{destinationLocation}</span>
                    </p>
                  )}
                </div>
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {activeDestination.stay}
                </span>
              </div>

              {destinationDescription && (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {destinationDescription}
                </p>
              )}

              {!!destinationTags.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {destinationTags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 text-slate-500">
                <Calendar size={14} />
                {hasMultipleDestinations ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">
                      {destinationDateRange}
                    </p>
                    <div className="flex justify-center gap-2 sm:justify-start">
                      {destinations.map((destination, index) => (
                        <button
                          key={destination.id || destination.name}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === activeIndex
                              ? "w-7 bg-primary"
                              : "w-2 bg-slate-300 hover:bg-slate-400"
                          }`}
                          aria-label={`Show ${destination.name}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold">
                    {destinationDateRange}
                  </span>
                )}
              </div>

              {activeDestination.slug && (
                <Link
                  to={`/destinations/${activeDestination.slug}`}
                  className="flex items-center gap-1 text-sm font-bold text-primary group"
                >
                  View Details{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

const TripOverview = ({ trip }) => {
  const total_budget =
    trip?.agent_context?.itinerary_design?.rough_budget?.total_estimated_budget;
  return (
    <Card className="p-0 md:p-6 bg-transparent md:bg-white rounded-none md:rounded-2xl pt-4 md:pt-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={trip.status} />
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
              {trip.trip_pace} pace
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            {trip.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {trip.overview}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-4">
        <SummaryMetric
          icon={CalendarDays}
          label="Start date"
          value={formatDate(trip.start_date)}
        />
        <SummaryMetric
          icon={Clock3}
          label="Duration"
          value={
            trip.nights
              ? `${trip.nights} nights`
              : `${trip.duration_days || "-"} days`
          }
        />
        <SummaryMetric
          icon={Users}
          label="Travelers"
          value={`${trip.travelers_count || 1} traveler${
            Number(trip.travelers_count || 1) === 1 ? "" : "s"
          }`}
        />
        <SummaryMetric
          icon={DollarSign}
          label="Budget"
          value={total_budget || "Not set"}
        />
      </div>
      <hr className="my-6" />

      <DestinationSlider
        destinations={trip.destinations}
        tripStartDate={trip.start_date}
        tripEndDate={trip.end_date}
      />
    </Card>
  );
};

export default TripOverview;
