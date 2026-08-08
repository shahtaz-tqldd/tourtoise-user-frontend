import React, { useCallback, useMemo } from "react";
import { CalendarDays, MapPin, Newspaper, Plane, PlaneTakeoff, Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import { EmptyState } from "@/components/shared/utils";
import TabMenu from "@/components/ui/tab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import useTitle from "@/hooks/useTitle";
import { useDestinationInfiniteListInfiniteQuery } from "@/features/destination/destinationApiSlice";
import { useTripInfiniteListInfiniteQuery } from "@/features/trips/tripApiSlice";
import { useJournalInfiniteListInfiniteQuery } from "@/features/journal/journalApiSlice";
import DestinationCard from "@/pages/destinations/components/destination-card";
import TripCard from "@/pages/trips/components/trip-card";
import JournalCard from "@/pages/journal/components/journal-card";
import { normalizeJournals } from "@/pages/journal/journal-utils";

const SEARCH_TABS = [
  { value: "destinations", label: "Destinations", icon: MapPin },
  { value: "trips", label: "Trips", icon: CalendarDays },
  { value: "journals", label: "Journals", icon: Newspaper },
];

const isValidTab = (tab) => SEARCH_TABS.some((item) => item.value === tab);

const unwrapTrips = (response) => {
  const payload = response?.data || response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;

  return [];
};

const SearchPage = () => {
  useTitle("Search");
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const urlSearch = urlParams.get("q") || "";
  const urlTab = urlParams.get("tab") || "destinations";
  const activeTab = isValidTab(urlTab) ? urlTab : "destinations";
  const debouncedSearchQuery = useDebounce(urlSearch.trim(), 400);
  const hasSearchQuery = Boolean(debouncedSearchQuery);

  const searchParams = useMemo(
    () => ({
      page_size: 12,
      search: debouncedSearchQuery || undefined,
    }),
    [debouncedSearchQuery],
  );

  const {
    data: destinationData,
    isLoading: isDestinationLoading,
    isFetching: isDestinationFetching,
    isError: isDestinationError,
    fetchNextPage: fetchNextDestinationPage,
    hasNextPage: hasNextDestinationPage,
    isFetchingNextPage: isFetchingNextDestinationPage,
  } = useDestinationInfiniteListInfiniteQuery(searchParams, {
    skip: activeTab !== "destinations" || !hasSearchQuery,
  });

  const {
    data: tripData,
    isLoading: isTripLoading,
    isFetching: isTripFetching,
    isError: isTripError,
    fetchNextPage: fetchNextTripPage,
    hasNextPage: hasNextTripPage,
    isFetchingNextPage: isFetchingNextTripPage,
  } = useTripInfiniteListInfiniteQuery(searchParams, {
    skip: activeTab !== "trips" || !hasSearchQuery,
  });

  const {
    data: journalData,
    isLoading: isJournalLoading,
    isFetching: isJournalFetching,
    isError: isJournalError,
    fetchNextPage: fetchNextJournalPage,
    hasNextPage: hasNextJournalPage,
    isFetchingNextPage: isFetchingNextJournalPage,
  } = useJournalInfiniteListInfiniteQuery(searchParams, {
    skip: activeTab !== "journals" || !hasSearchQuery,
  });

  const destinations = useMemo(
    () => destinationData?.pages?.flatMap((page) => page?.data || []) || [],
    [destinationData],
  );
  const trips = useMemo(
    () => tripData?.pages?.flatMap((page) => unwrapTrips(page)) || [],
    [tripData],
  );
  const journals = useMemo(
    () =>
      normalizeJournals(
        journalData?.pages?.flatMap((page) => page?.data || []) || [],
      ),
    [journalData],
  );

  const isSearching = urlSearch.trim() !== debouncedSearchQuery;
  const activeState = {
    destinations: {
      items: hasSearchQuery ? destinations : [],
      isLoading:
        isDestinationLoading ||
        (isDestinationFetching && !destinationData?.pages?.length) ||
        isSearching,
      isError: isDestinationError,
      hasMore: hasNextDestinationPage,
      isFetchingMore: isFetchingNextDestinationPage,
      fetchNextPage: fetchNextDestinationPage,
      loadingLabel: "Loading more destinations...",
      emptyTitle: "No destinations found",
    },
    trips: {
      items: hasSearchQuery ? trips : [],
      isLoading:
        isTripLoading ||
        (isTripFetching && !tripData?.pages?.length) ||
        isSearching,
      isError: isTripError,
      hasMore: hasNextTripPage,
      isFetchingMore: isFetchingNextTripPage,
      fetchNextPage: fetchNextTripPage,
      loadingLabel: "Loading more trips...",
      emptyTitle: "No trips found",
    },
    journals: {
      items: hasSearchQuery ? journals : [],
      isLoading:
        isJournalLoading ||
        (isJournalFetching && !journalData?.pages?.length) ||
        isSearching,
      isError: isJournalError,
      hasMore: hasNextJournalPage,
      isFetchingMore: isFetchingNextJournalPage,
      fetchNextPage: fetchNextJournalPage,
      loadingLabel: "Loading more journals...",
      emptyTitle: "No journals found",
    },
  }[activeTab];

  const updateTab = (tab) => {
    const nextParams = new URLSearchParams(location.search);

    nextParams.set("tab", tab);
    if (urlSearch.trim()) nextParams.set("q", urlSearch.trim());
    else nextParams.delete("q");

    navigate({
      pathname: "/search",
      search: `?${nextParams.toString()}`,
    });
  };

  const updateSearch = (value, options = {}) => {
    const nextParams = new URLSearchParams(location.search);
    const trimmedValue = value.trim();

    if (trimmedValue) nextParams.set("q", value);
    else nextParams.delete("q");
    nextParams.set("tab", activeTab);

    navigate(
      {
        pathname: "/search",
        search: `?${nextParams.toString()}`,
      },
      { replace: options.replace ?? true },
    );
  };

  const submitSearch = (event) => {
    event.preventDefault();
    updateSearch(urlSearch, { replace: false });
  };

  const loadMore = useCallback(() => {
    if (!activeState?.hasMore || activeState?.isFetchingMore) return;
    activeState.fetchNextPage();
  }, [activeState]);

  return (
    <section className="space-y-6 pt-5 pb-20 md:pb-5">
      <div className="space-y-4">
        <div>
          <div>
            <h1 className="text-xl font-bold text-slate-950 md:text-2xl">
              Search
            </h1>
            <p className="mt-1 md:block hidden text-sm text-slate-500">
              Search destinations, trips, and journals from one place.
            </p>
          </div>

          <form
            className="relative mt-4 w-full md:hidden"
            onSubmit={submitSearch}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={urlSearch}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search destinations, trips, journals"
              className="h-12 rounded-full border-primary/15 bg-white pl-11 pr-20 text-sm shadow-none focus-visible:ring-primary/20"
              autoFocus
            />
            {urlSearch && (
              <button
                type="button"
                onClick={() => updateSearch("")}
                className="absolute right-12 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <Button
              type="submit"
              size="icon-sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              aria-label="Search"
            >
              <Search size={15} />
            </Button>
          </form>
        </div>

        <TabMenu
          tabs={SEARCH_TABS}
          activeTab={activeTab}
          setActiveTab={updateTab}
          scrollable
          className="bg-transparent"
        />
      </div>

      <SearchResults
        activeTab={activeTab}
        state={activeState}
        onLoadMore={loadMore}
        debouncedSearchQuery={debouncedSearchQuery}
        hasSearchQuery={hasSearchQuery}
      />
    </section>
  );
};

const SearchResults = ({
  activeTab,
  state,
  onLoadMore,
  debouncedSearchQuery,
  hasSearchQuery,
}) => {
  if (!hasSearchQuery) {
    return (
      <EmptyState
        title="Start a search"
        description="Enter a search term to find matching destinations, trips, or journals."
      />
    );
  }

  if (state.isLoading) return <SearchSkeleton activeTab={activeTab} />;

  if (state.isError) {
    return (
      <EmptyState
        title="Could not load results"
        description="Check the search endpoint and try again."
      />
    );
  }

  if (!state.items.length) {
    return (
      <EmptyState
        title={state.emptyTitle}
        description={
          debouncedSearchQuery
            ? "Try a different search term or switch tabs."
            : "Start typing to narrow the results."
        }
      />
    );
  }

  return (
    <>
      {activeTab === "destinations" && (
        <div className="grid gap-4 xl:grid-cols-3">
          {state.items.map((destination) => (
            <DestinationCard
              key={destination.slug || destination.id}
              destination={destination}
            />
          ))}
        </div>
      )}

      {activeTab === "trips" && (
        <div className="space-y-4">
          {state.items.map((trip) => (
            <TripCard key={trip.id || trip.trip_id || trip.uuid} trip={trip} />
          ))}
        </div>
      )}

      {activeTab === "journals" && (
        <div className="mx-auto max-w-3xl space-y-6 md:space-y-4">
          {state.items.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              isSaved={journal.is_saved}
            />
          ))}
        </div>
      )}

      <InfiniteScroll
        hasMore={state.hasMore}
        isLoading={state.isFetchingMore}
        onLoadMore={onLoadMore}
        loadingLabel={state.loadingLabel}
      />
    </>
  );
};

const SearchSkeleton = ({ activeTab }) => {
  if (activeTab === "destinations") {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-[28px] bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-3xl bg-slate-100"
        />
      ))}
    </div>
  );
};

export default SearchPage;
