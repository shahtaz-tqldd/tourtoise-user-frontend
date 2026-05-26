import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/ui/status";
import { useTripListQuery } from "@/features/trips/tripApiSlice";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const pageSize = 24;
const pastStatuses = new Set(["completed", "archived", "cancelled"]);

const unwrapTrips = (response) => {
  const payload = response?.data || response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;

  return [];
};

const getMeta = (response) => response?.meta || response?.data?.meta || {};

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const formatUpdatedAt = (value) => {
  if (!value) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatMoney = (amount, currency) => {
  if (!amount) return "Budget not set";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const getTripUrl = (trip) => `/trips/${trip.slug || trip.id}`;

const getDestinationLabel = (trip) => {
  if (trip.primary_destination?.name) return trip.primary_destination.name;
  if (trip.destinations_count) {
    return `${trip.destinations_count} destination${
      trip.destinations_count === 1 ? "" : "s"
    }`;
  }

  return "Destination pending";
};

const isPastTrip = (trip) => {
  const status = trip.status?.toLowerCase();
  if (pastStatuses.has(status)) return true;
  if (!trip.end_date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(`${trip.end_date}T00:00:00`);

  return endDate < today;
};

const filterTrips = (trips, filters) => {
  const query = filters.search.trim().toLowerCase();

  return trips.filter((trip) => {
    const matchesSearch =
      !query ||
      [
        trip.title,
        trip.status,
        trip.trip_pace,
        trip.primary_destination?.name,
        trip.primary_destination?.country,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

    const matchesStatus =
      filters.status === "all" || trip.status === filters.status;
    const matchesDate =
      !filters.startAfter ||
      !trip.start_date ||
      new Date(`${trip.start_date}T00:00:00`) >=
        new Date(`${filters.startAfter}T00:00:00`);

    return matchesSearch && matchesStatus && matchesDate;
  });
};

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "planned", label: "Planned" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "cancelled", label: "Cancelled" },
];

const TripCard = ({ trip, compact = false }) => (
  <article className="rounded-[28px] bg-white p-6 border border-transparent transition hover:border-primary/40 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={trip.status || "draft"} />
          {trip.visibility && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
              {trip.visibility}
            </span>
          )}
        </div>
        <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-slate-950">
          {trip.title || "Untitled trip"}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={15} />
          {getDestinationLabel(trip)}
        </p>
      </div>
    </div>

    <div
      className={`mt-4 grid gap-3 text-sm text-slate-600 ${
        compact ? "sm:grid-cols-2" : "sm:grid-cols-4"
      }`}
    >
      <span className="flex items-center gap-2">
        <CalendarDays size={16} className="text-slate-400" />
        {formatDate(trip.start_date)}
      </span>
      <span className="flex items-center gap-2">
        <Clock3 size={16} className="text-slate-400" />
        {trip.nights ? `${trip.nights} nights` : "Duration pending"}
      </span>
      <span className="flex items-center gap-2">
        <Users size={16} className="text-slate-400" />
        {trip.travelers_count || 1} traveler
        {Number(trip.travelers_count) === 1 ? "" : "s"}
      </span>
      <span className="flex items-center gap-2">
        <DollarSign size={16} className="text-slate-400" />
        {formatMoney(trip.total_budget, trip.budget_currency)}
      </span>
    </div>

    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500">
        Updated {formatUpdatedAt(trip.updated_at)}
      </p>
      <Button asChild variant="outline" size="sm">
        <Link to={getTripUrl(trip)}>
          Details
          <ArrowRight size={15} />
        </Link>
      </Button>
    </div>
  </article>
);

const EmptyState = ({ title, description, onClear }) => (
  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-10 py-24 text-center">
    <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
      {description}
    </p>
    {onClear && (
      <Button className="mt-4" variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    )}
  </div>
);

const TripFilter = ({
  totalTrips,
  filters,
  updateFilter,
  clearFilters,
  hasFilters,
}) => {
  const selectedStatus = statusOptions.find(
    (option) => option.value === filters.status,
  );

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="border-b border-slate-100 bg-slate-50/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Find a trip
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {totalTrips} matching {totalTrips === 1 ? "trip" : "trips"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={clearFilters}
            disabled={!hasFilters}
            aria-label="Reset filters"
            className="rounded-full text-slate-500 hover:text-slate-950"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <label className="block space-y-2">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search Amalfi, draft, private..."
              className="h-12 rounded-full border-slate-200 bg-slate-50 pl-11 text-sm shadow-none focus-visible:ring-primary/15"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => updateFilter("search", "")}
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </label>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <SlidersHorizontal size={14} />
            Status
          </div>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => {
              const isSelected = filters.status === option.value;

              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() =>
                    updateFilter("status", isSelected ? "all" : option.value)
                  }
                  className={cn(
                    "min-h-10 rounded-xl border px-2 text-center text-xs font-semibold transition",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <CalendarDays size={14} />
            Date
          </div>
          <Input
            type="date"
            value={filters.startAfter}
            onChange={(event) => updateFilter("startAfter", event.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-white shadow-none"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Search size={16} className="text-primary" />
              Current match
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:text-green-800"
              >
                Clear all
              </button>
            )}
          </div>

          {hasFilters ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.search && (
                <button
                  type="button"
                  onClick={() => updateFilter("search", "")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {filters.search}
                  <X size={13} />
                </button>
              )}
              {selectedStatus && (
                <button
                  type="button"
                  onClick={() => updateFilter("status", "all")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {selectedStatus.label}
                  <X size={13} />
                </button>
              )}
              {filters.startAfter && (
                <button
                  type="button"
                  onClick={() => updateFilter("startAfter", "")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  From {formatDate(filters.startAfter)}
                  <X size={13} />
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-5 text-slate-500">
              Search by trip name or narrow the list by status and start date.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

const TripsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    startAfter: "",
  });

  const queryArgs = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: filters.search || undefined,
    }),
    [filters.search, page],
  );

  const { data, isFetching, isError } = useTripListQuery(queryArgs);
  const trips = useMemo(() => unwrapTrips(data), [data]);
  const meta = getMeta(data);
  const filteredTrips = useMemo(
    () => filterTrips(trips, filters),
    [filters, trips],
  );
  const activeTrips = filteredTrips.filter((trip) => !isPastTrip(trip));
  const pastTrips = filteredTrips.filter(isPastTrip);
  const visibleTrips = activeTab === "active" ? activeTrips : pastTrips;
  const hasFilters =
    filters.search || filters.status !== "all" || filters.startAfter;

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "all", startAfter: "" });
    setPage(1);
  };

  return (
    <section className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">My trips</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Keep the current plan easy to resume and use the archive to find
              older itineraries when you need them.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "active"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Active trips
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {activeTrips.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "past"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Past trips
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {pastTrips.length}
            </span>
          </button>
        </div>

        {isFetching && (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        )}

        {isError && !isFetching && (
          <EmptyState
            title="Could not load trips"
            description="Check the trips endpoint and try again."
          />
        )}

        {!isFetching && !isError && visibleTrips.length > 0 && (
          <div>
            {visibleTrips.map((trip) => (
              <TripCard
                key={trip.id || trip.slug}
                trip={trip}
                compact={activeTab === "past"}
              />
            ))}
          </div>
        )}

        {!isFetching && !isError && !visibleTrips.length && (
          <EmptyState
            title={activeTab === "active" ? "No active trips" : "No past trips"}
            description={
              hasFilters
                ? "No trips match the current search and filters."
                : activeTab === "active"
                  ? "Start planning from a destination page and the current trip will appear here."
                  : "Completed, archived, cancelled, or ended trips will collect here."
            }
            onClear={hasFilters ? clearFilters : undefined}
          />
        )}

        {!isFetching && !isError && trips.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              Showing page {meta.page || page}
              {meta.count ? ` of ${meta.count} trips` : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || isFetching}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={
                  (!meta.next && page >= (meta.num_pages || page)) || isFetching
                }
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <TripFilter
        totalTrips={filteredTrips.length}
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        hasFilters={Boolean(hasFilters)}
      />
    </section>
  );
};

export default TripsPage;
