import React, { useCallback, useMemo, useState } from "react";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import ListingHeader from "@/components/shared/listing-header";
import DestinationCard from "./components/destination-card";
import DestinationFilter from "./components/destination-filter";
import {
  useDestinationInfiniteListInfiniteQuery,
  useSaveDestinationInfiniteListInfiniteQuery,
} from "@/features/destination/destinationApiSlice";
import { BucketListDrawer, BucketListPanel } from "./components/bucket-list";
import {
  DestinationFetchError,
  LoadingDestinationList,
} from "./components/fallback";
import { EmptyState } from "@/components/shared/utils";
import useTitle from "@/hooks/useTitle";

const DestinationPage = () => {
  useTitle("tourtoise - let's find your next tour destination");
  // filter
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState([]);
  const [destinationTypes, setDestinationTypes] = useState([]);
  const [budgetTiers, setBudgetTiers] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const destinationQuery = useMemo(
    () => ({
      page: 1,
      page_size: 12,
      search: searchQuery || undefined,
      destination_type: destinationTypes,
      country_code: countries,
      budget_tier: budgetTiers,
      difficulty: difficulties,
    }),
    [budgetTiers, countries, destinationTypes, difficulties, searchQuery],
  );
  const clearFilters = () => {
    setSearchQuery("");
    setCountries([]);
    setDestinationTypes([]);
    setBudgetTiers([]);
    setDifficulties([]);
  };

  // destination
  const {
    data,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDestinationInfiniteListInfiniteQuery(destinationQuery);
  const destinations = useMemo(
    () => data?.pages?.flatMap((page) => page?.data || []) || [],
    [data],
  );
  const isInitialDestinationLoading =
    isLoading || (isFetching && !data?.pages?.length);

  // saved destination
  const {
    data: savedData,
    isLoading: isSavedLoading,
    isFetching: isSavedFetching,
    fetchNextPage: fetchNextSavedPage,
    hasNextPage: hasNextSavedPage,
    isFetchingNextPage: isFetchingSavedNextPage,
  } = useSaveDestinationInfiniteListInfiniteQuery({
    pageSize: 6,
  });
  const savedDestinations = useMemo(
    () => savedData?.pages?.flatMap((page) => page?.data || []) || [],
    [savedData],
  );
  const isInitialSavedLoading =
    isSavedLoading || (isSavedFetching && !savedData?.pages?.length);

  const handleLoadMoreDestinations = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleLoadMoreSavedDestinations = useCallback(() => {
    if (!hasNextSavedPage || isFetchingSavedNextPage) return;
    fetchNextSavedPage();
  }, [fetchNextSavedPage, hasNextSavedPage, isFetchingSavedNextPage]);

  return (
    <section className="pt-5 pb-20 md:pb-5">
      <div className="space-y-8">
        <ListingHeader
          title="Where's Next?"
          filters={
            <DestinationFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              countries={countries}
              setCountries={setCountries}
              destinationTypes={destinationTypes}
              setDestinationTypes={setDestinationTypes}
              budgetTiers={budgetTiers}
              setBudgetTiers={setBudgetTiers}
              difficulties={difficulties}
              setDifficulties={setDifficulties}
              clearFilters={clearFilters}
              actions={
                <BucketListDrawer
                  savedDestinations={savedDestinations}
                  isFetching={isInitialSavedLoading}
                  hasMore={hasNextSavedPage}
                  isFetchingNextPage={isFetchingSavedNextPage}
                  onLoadMore={handleLoadMoreSavedDestinations}
                />
              }
            />
          }
        />

        <div className="grid gap-4 xl:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>

        {isInitialDestinationLoading && <LoadingDestinationList />}

        {!isInitialDestinationLoading && !isError && (
          <InfiniteScroll
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            onLoadMore={handleLoadMoreDestinations}
            loadingLabel="Loading more destinations..."
          />
        )}

        {isError && !isInitialDestinationLoading && <DestinationFetchError />}

        {!isInitialDestinationLoading && !isError && !destinations.length && (
          <EmptyState
            title="No destinations found"
            description="Adjust the search, country, or destination type filters."
          />
        )}
      </div>

      {/* <BucketListPanel
        savedDestinations={savedDestinations}
        isFetching={isInitialSavedLoading}
        hasMore={hasNextSavedPage}
        isFetchingNextPage={isFetchingSavedNextPage}
        onLoadMore={handleLoadMoreSavedDestinations}
        className="hidden lg:block"
      /> */}
    </section>
  );
};

export default DestinationPage;
