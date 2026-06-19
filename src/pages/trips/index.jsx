import { PageTitle } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTripListQuery } from "@/features/trips/tripApiSlice";
import { ChevronLeft, ChevronRight, Luggage, Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import TripCard from "./trip-details/trip-card";
import TabMenu from "@/components/ui/tab";

const pageSize = 24;
const historyPageSize = 12;
const pastStatuses = new Set(["completed", "archived", "cancelled"]);
const activeStatusAliases = new Set(["active", "ready"]);

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

const isPastTrip = (trip) => {
  const status = trip.status?.toLowerCase();
  if (pastStatuses.has(status)) return true;
  if (!trip.end_date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(`${trip.end_date}T00:00:00`);

  return endDate < today;
};

const statusMatches = (tripStatus, selectedStatus) => {
  if (selectedStatus === "all") return true;

  const status = tripStatus?.toLowerCase();
  if (selectedStatus === "active") return activeStatusAliases.has(status);

  return status === selectedStatus;
};

const filterCurrentTrips = (trips, status) =>
  trips.filter(
    (trip) => !isPastTrip(trip) && statusMatches(trip.status, status),
  );

const SearchField = ({
  value,
  onChange,
  onClear,
  placeholder,
  className = "",
}) => (
  <div className={`relative w-full min-w-0 ${className}`}>
    <Search
      size={17}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-full border-slate-200 bg-slate-50 pl-11 pr-11 text-sm shadow-none focus-visible:ring-primary/15"
    />
    {value && (
      <button
        type="button"
        onClick={onClear}
        className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
        aria-label="Clear search"
      >
        <X size={15} />
      </button>
    )}
  </div>
);

const TripListLoader = ({ compact = false }) => (
  <div className="grid gap-3">
    {Array.from({ length: compact ? 4 : 3 }).map((_, index) => (
      <div
        key={index}
        className={`animate-pulse rounded-lg border border-slate-200 bg-slate-100 ${
          compact ? "h-32" : "h-44"
        }`}
      />
    ))}
  </div>
);

const EmptyState = ({ title, description, onClear, compact = false }) => (
  <div
    className={`border border-dashed border-slate-300 bg-white text-center ${
      compact ? "rounded-2xl px-6 py-12" : "rounded-[28px] px-10 py-24"
    }`}
  >
    <h2
      className={`font-semibold text-slate-950 ${
        compact ? "text-base" : "text-lg"
      }`}
    >
      {title}
    </h2>
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

const TripsPage = () => {
  const [page, setPage] = useState(1);
  const [activeSearch, setActiveSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [historySearch, setHistorySearch] = useState("");
  const [mobileTab, setMobileTab] = useState("active");

  const queryArgs = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: activeSearch || undefined,
      status:
        activeStatus === "all"
          ? undefined
          : activeStatus === "active"
            ? Array.from(activeStatusAliases)
            : activeStatus,
    }),
    [activeSearch, activeStatus, page],
  );

  const historyQueryArgs = useMemo(
    () => ({
      page: 1,
      page_size: historyPageSize,
      search: historySearch || undefined,
      status: Array.from(pastStatuses),
    }),
    [historySearch],
  );

  const { data, isFetching, isError } = useTripListQuery(queryArgs);
  const {
    data: historyData,
    isFetching: isHistoryFetching,
    isError: isHistoryError,
  } = useTripListQuery(historyQueryArgs);
  const trips = useMemo(() => unwrapTrips(data), [data]);
  const historyTrips = useMemo(() => unwrapTrips(historyData), [historyData]);
  const meta = getMeta(data);
  const activeTrips = useMemo(
    () => filterCurrentTrips(trips, activeStatus),
    [activeStatus, trips],
  );
  const pastTrips = useMemo(
    () => historyTrips.filter(isPastTrip),
    [historyTrips],
  );
  const hasActiveFilters = activeSearch || activeStatus !== "all";

  const updateActiveSearch = (value) => {
    setActiveSearch(value);
    setPage(1);
  };

  const updateActiveStatus = (value) => {
    setActiveStatus(value);
    setPage(1);
  };

  const clearActiveFilters = () => {
    setActiveSearch("");
    setActiveStatus("all");
    setPage(1);
  };

  return (
    <section className="space-y-6 py-5 relative">
      <PageTitle
        title="Trip Plans"
        text="Resume current plans and drafts from one focused list."
        className="block md:hidden"
      />

      <TabMenu
        tabs={[
          {
            label: "Active Plan",
            value: "active",
          },
          {
            label: "Trip History",
            value: "history",
          },
        ]}
        activeTab={mobileTab}
        setActiveTab={setMobileTab}
        className="flex md:hidden"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div
          className={`space-y-6 ${
            mobileTab === "active" ? "block" : "hidden"
          } lg:block`}
        >
          <PageTitle
            title="Trip Plans"
            text="Resume current plans and drafts from one focused list."
            className="hidden md:block"
          />
          <div className="flex w-full gap-3">
            <SearchField
              value={activeSearch}
              onChange={updateActiveSearch}
              onClear={() => updateActiveSearch("")}
              placeholder="Search active trips..."
              className="flex-1"
            />
            <Select value={activeStatus} onValueChange={updateActiveStatus}>
              <SelectTrigger className="!h-12 rounded-full border-slate-200 bg-slate-50 px-4 shadow-none">
                <SelectValue placeholder="Trip status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFetching && <TripListLoader />}

          {isError && !isFetching && (
            <EmptyState
              title="Could not load active trips"
              description="Check the trips endpoint and try again."
            />
          )}

          {!isFetching && !isError && activeTrips.length > 0 && (
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <TripCard key={trip.id || trip.slug} trip={trip} />
              ))}
            </div>
          )}

          {!isFetching && !isError && !activeTrips.length && (
            <EmptyState
              title="No active trips"
              description={
                hasActiveFilters
                  ? "No current trips match the search and status filter."
                  : "Start planning from a destination page and active trips or drafts will appear here."
              }
              onClear={hasActiveFilters ? clearActiveFilters : undefined}
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
                    (!meta.next && page >= (meta.num_pages || page)) ||
                    isFetching
                  }
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <TripHistory
          className={`${mobileTab === "history" ? "block" : "hidden"} lg:block`}
          trips={pastTrips}
          search={historySearch}
          onSearchChange={setHistorySearch}
          isFetching={isHistoryFetching}
          isError={isHistoryError}
        />
      </div>
    </section>
  );
};

const TripHistory = ({
  className = "",
  trips,
  search,
  onSearchChange,
  isFetching,
  isError,
}) => {
  return (
    <aside
      className={`${className} space-y-5 lg:sticky lg:top-24 lg:self-start`}
    >
      <div className="hidden md:flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Luggage size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950">Trip History</h2>
            <p className="text-sm leading-5 text-slate-500">
              Your past completed trips
            </p>
          </div>
        </div>
      </div>

      <SearchField
        value={search}
        onChange={onSearchChange}
        onClear={() => onSearchChange("")}
        placeholder="Search past trips..."
      />

      {isFetching && <TripListLoader compact />}

      {isError && !isFetching && (
        <EmptyState
          title="Could not load history"
          description="Check the trips endpoint and try again."
          compact
        />
      )}

      {!isFetching && !isError && trips.length > 0 && (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id || trip.slug} trip={trip} compact />
          ))}
        </div>
      )}

      {!isFetching && !isError && !trips.length && (
        <EmptyState
          title="No past trips"
          description={
            search
              ? "No past trips match the current search."
              : "Completed, archived, cancelled, or ended trips will collect here."
          }
          onClear={search ? () => onSearchChange("") : undefined}
          compact
        />
      )}
    </aside>
  );
};

export default TripsPage;
