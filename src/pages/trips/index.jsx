import { useTripListQuery } from "@/features/trips/tripApiSlice";
import React, { useMemo, useState } from "react";
import { TripHistory } from "./components/trip-history";
import TripsFeed from "./components/trips-feed";
import TripsPageHeader from "./components/trips-page-header";

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
    <section className="relative space-y-6 pt-5 pb-20 md:pb-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <TripsPageHeader
            tripsCount={activeTrips.length}
            totalTrips={totalTrips}
            activeSearch={activeSearch}
            onActiveSearchChange={updateActiveSearch}
            activeStatus={activeStatus}
            onActiveStatusChange={updateActiveStatus}
            historyTrips={pastTrips}
            historySearch={historySearch}
            onHistorySearchChange={setHistorySearch}
            isHistoryFetching={isHistoryFetching}
            isHistoryError={isHistoryError}
          />

          <TripsFeed
            trips={activeTrips}
            isFetching={isFetching}
            isError={isError}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearActiveFilters}
          />
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

export default TripsPage;
