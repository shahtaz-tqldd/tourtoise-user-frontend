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
import PreviewContent from "@/components/shared/preview-content";
import { Link, useNavigate } from "react-router-dom";
import TripActionsDropdown from "../../components/trip-actions-dropdown";
import { Image, VisibilityStatus } from "@/components/shared/utils";
import { formatDateRange } from "@/lib/date-time";

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const formatMoney = (amount, currency) => {
  if (amount === null || amount === undefined || amount === "")
    return "Not set";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const budgetRows = [
  { key: "transport", label: "Transport" },
  { key: "food", label: "Food" },
  { key: "activities", label: "Activities" },
  { key: "tickets_or_entry", label: "Tickets or entry" },
  { key: "miscellaneous", label: "Miscellaneous" },
];

const SummaryMetric = ({ icon, label, value, component }) => (
  <div className="rounded-xl bg-primary/5 p-4">
    <div className="flx gap-2">
      {React.createElement(icon, { className: "text-primary", size: 14 })}
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    </div>
    <div className="flex flex-col mt-4 gap-2">
      <p className="text-sm font-semibold text-slate-950">{value}</p>
      {component ? component : null}
    </div>
  </div>
);

const BudgetBreakdownDialog = ({ open, onOpenChange, budget, currency }) => {
  const total = budget?.total_estimated ?? budget?.total_estimated_budget;

  return (
    <PreviewContent open={open} onOpenChange={onOpenChange} className="h-fit">
      <div className="flex min-h-full flex-col bg-white pt-2 md:pt-0">
        <div className="border-b border-slate-200 px-5 py-5 md:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Budget breakdown
            </h2>
            <p className="text-sm text-slate-500">
              Estimated costs for this trip.
            </p>
          </div>
        </div>

        <div className="space-y-6 p-5 md:p-6">
          {budgetRows.map((row) => (
            <div key={row.key} className="flbx gap-4">
              <span className="text-sm font-semibold text-slate-600">
                {row.label}
              </span>
              <span className="text-sm font-bold text-slate-950">
                {formatMoney(budget?.[row.key], currency)}
              </span>
            </div>
          ))}

          <div className="flbx gap-4 border-t pt-4">
            <span className="text-sm font-semibold">Total estimated</span>
            <span className="text-md font-bold">
              {formatMoney(total, currency)}
            </span>
          </div>

          {budget?.note && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {budget.note}
            </p>
          )}
        </div>
      </div>
    </PreviewContent>
  );
};

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
          <div className="h-56 overflow-hidden">
            <Image
              src={activeDestination.image_url}
              alt={activeDestination.name}
            />
          </div>

          <div className="flex flex-col justify-between gap-5 bg-white p-4 ">
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
  const navigate = useNavigate();
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const budget = trip?.budget || {};
  const totalBudget = budget.total_estimated ?? budget.total_estimated_budget;
  const startAddress = [
    trip?.start_location?.address,
    trip?.start_location?.city,
    trip?.start_location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="p-0 md:p-6 bg-transparent md:bg-white rounded-none md:rounded-2xl pt-4 md:pt-6">
      <div className="flex gap-5 items-start justify-between">
        <div className="max-w-3xl min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={trip?.status} />
            <VisibilityStatus visibility={trip?.visibility} />
          </div>
          <h1 className="mt-5 text-2xl md:text-3xl font-bold text-slate-950">
            {trip.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {trip.overview}
          </p>
        </div>
        <TripActionsDropdown
          trip={trip}
          destination={trip.primary_destination || trip.destinations?.[0]}
          onDeleted={() => navigate("/trips")}
          triggerClassName="self-start border border-slate-200 bg-white shadow-sm"
        />
      </div>

      <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-4">
        <SummaryMetric
          icon={CalendarDays}
          label="Start date"
          value={formatDate(trip.start_date)}
          component={
            <span className="text-xs text-slate-500 font-medium capitalize">
              Ending {formatDate(trip.end_date)}
            </span>
          }
        />
        <SummaryMetric
          icon={Clock3}
          label="Duration"
          value={
            trip.nights
              ? `${trip.nights} nights`
              : `${trip.duration_days || "-"} days`
          }
          component={
            <span className="text-xs text-slate-500 font-medium capitalize">
              within {trip.duration_days} days
            </span>
          }
        />
        <SummaryMetric
          icon={Users}
          label="Travelers"
          value={`${trip.travelers_count || 1} traveler${
            Number(trip.travelers_count || 1) === 1 ? "" : "s"
          }`}
          component={
            <span className="text-xs text-slate-500 font-medium capitalize">
              {trip.traveler_type} tour
            </span>
          }
        />
        <SummaryMetric
          icon={DollarSign}
          label="Budget"
          value={formatMoney(totalBudget, trip.budget_currency)}
          component={
            <button
              onClick={() => setIsBudgetOpen(true)}
              className="text-xs text-primary font-semibold underline w-fit"
            >
              View breakdown
            </button>
          }
        />
      </div>
      {startAddress && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 md:bg-slate-50">
          <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-slate-950">Start location</p>
            <p className="mt-1 leading-6">{startAddress}</p>
          </div>
        </div>
      )}
      <hr className="border-t border-slate-200/80 my-6 -mx-6" />

      <DestinationSlider
        destinations={trip.destinations}
        tripStartDate={trip.start_date}
        tripEndDate={trip.end_date}
      />

      <BudgetBreakdownDialog
        open={isBudgetOpen}
        onOpenChange={setIsBudgetOpen}
        budget={budget}
        currency={trip.budget_currency}
      />
    </Card>
  );
};

export default TripOverview;
