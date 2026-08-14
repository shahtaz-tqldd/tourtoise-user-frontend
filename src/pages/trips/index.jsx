import React, { useMemo, useState } from "react";

// trips
import { Container } from "@/components/ui/container";
import { TripHistory } from "./components/trip-history";
import TripsFeed from "./components/trips-feed";
import TripsPageHeader from "./components/trips-page-header";

// hooks and services
import useTitle from "@/hooks/useTitle";
import { useTripListQuery } from "@/features/trips/tripApiSlice";

const pageSize = 24;
const historyPageSize = 12;
const pastStatuses = new Set(["completed", "archived", "cancelled"]);
const activeStatuses = ["draft", "ready", "in_progress"];

const isPastTrip = (trip) => {
  const status = trip.status?.toLowerCase();
  if (pastStatuses.has(status)) return true;
  if (!trip.end_date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(`${trip.end_date}T00:00:00`);

  return endDate < today;
};

const TripsPage = () => {
  useTitle("tourtoise - my trips");
  const [page, setPage] = useState(1);
  const [activeSearch, setActiveSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState(["active"]);
  const [historySearch, setHistorySearch] = useState("");

  const queryArgs = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: activeSearch || undefined,
      status: Array.from(
        new Set(
          activeStatus.flatMap((status) =>
            status === "active" ? activeStatuses : status,
          ),
        ),
      ),
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

  const trips = useMemo(() => data?.data, [data]);
  const historyTrips = useMemo(() => historyData?.data, [historyData]);

  const pastTrips = useMemo(
    () => historyTrips?.filter(isPastTrip),
    [historyTrips],
  );

  const hasActiveFilters =
    activeSearch || activeStatus.length !== 1 || activeStatus[0] !== "active";

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
    setActiveStatus(["active"]);
    setPage(1);
  };

  return (
    <Container>
      <div className="h-full grid gap-6 md:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-6 h-full">
          <TripsPageHeader
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

          <div className="min-h-0 flex-1">
            <TripsFeed
              trips={trips}
              isFetching={isFetching}
              isError={isError}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearActiveFilters}
            />
          </div>
        </div>

        <TripHistory
          className="hidden lg:flex"
          trips={pastTrips}
          search={historySearch}
          onSearchChange={setHistorySearch}
          isFetching={isHistoryFetching}
          isError={isHistoryError}
        />
      </div>
    </Container>
  );
};

export default TripsPage;
