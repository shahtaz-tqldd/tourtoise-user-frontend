import ListingHeader from "@/components/shared/listing-header";
import SearchField from "@/components/shared/search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useTripListQuery } from "@/features/trips/tripApiSlice";
import {
  ChevronLeft,
  ChevronRight,
  History,
  Luggage,
  SlidersHorizontal,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import TripCard from "./trip-details/trip-card";

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

const TripStatusFilter = ({ value, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(value);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setDraftStatus(value);
    setOpen(nextOpen);
  };

  const applyFilter = () => {
    onApply(draftStatus);
    setOpen(false);
  };

  const cancelFilter = () => {
    setDraftStatus(value);
    setOpen(false);
  };

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-slate-200"
            aria-label="Open trip filters"
          >
            <SlidersHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(calc(100vw-2rem),320px)] rounded-2xl border-slate-200 bg-white p-0 shadow-xl"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-base font-bold text-slate-950">
              Filter trip plans
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose which trip status to show.
            </p>
          </div>

          <div className="space-y-2 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Status
            </p>
            {[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition ${
                  draftStatus === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <input
                  type="radio"
                  name="trip-status-filter"
                  value={option.value}
                  checked={draftStatus === option.value}
                  onChange={(event) => setDraftStatus(event.target.value)}
                  className="size-4 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
            <Button type="button" variant="outline" onClick={cancelFilter}>
              Cancel
            </Button>
            <Button type="button" onClick={applyFilter}>
              Apply
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {value !== "all" && (
        <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary" />
      )}
    </div>
  );
};

const TripsPage = () => {
  const [page, setPage] = useState(1);
  const [activeSearch, setActiveSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [historySearch, setHistorySearch] = useState("");

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
  const totalTrips = meta.count ?? meta.total ?? trips.length;

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
    <section className="relative space-y-6 py-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <ListingHeader
            title="Trip Plans"
            description={`Showing ${activeTrips.length} of ${totalTrips} trips`}
            filters={
              <div className="flex w-full gap-3 md:justify-end">
                <SearchField
                  value={activeSearch}
                  onChange={updateActiveSearch}
                  onClear={() => updateActiveSearch("")}
                  placeholder="Search active trips..."
                  className="max-w-sm flex-1"
                />
                <TripStatusFilter
                  value={activeStatus}
                  onApply={updateActiveStatus}
                />
                <TripHistoryDrawer
                  trips={pastTrips}
                  search={historySearch}
                  onSearchChange={setHistorySearch}
                  isFetching={isHistoryFetching}
                  isError={isHistoryError}
                />
              </div>
            }
          />

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
          className="hidden lg:block"
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

const TripHistoryDrawer = ({
  trips,
  search,
  onSearchChange,
  isFetching,
  isError,
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-12 rounded-full border-slate-200 lg:hidden"
        aria-label="Open trip history"
      >
        <History size={16} />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="w-[min(92vw,420px)] gap-0 overflow-y-auto p-0"
      showCloseButton={false}
    >
      <SheetHeader className="border-b border-slate-100 pr-12 text-left">
        <SheetTitle>Trip History</SheetTitle>
        <SheetDescription>Your past completed trips.</SheetDescription>
      </SheetHeader>
      <SheetClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-3 top-3 rounded-full"
          aria-label="Close trip history"
        >
          <X size={16} />
        </Button>
      </SheetClose>
      <div className="p-4">
        <TripHistory
          trips={trips}
          search={search}
          onSearchChange={onSearchChange}
          isFetching={isFetching}
          isError={isError}
        />
      </div>
    </SheetContent>
  </Sheet>
);

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
