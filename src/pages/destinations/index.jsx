import { useCallback, useMemo, useState } from "react";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import ListingHeader from "@/components/shared/listing-header";
import DestinationCard from "./components/destination-card";
import DestinationFilter from "./components/destination-filter";
import { useDestinationInfiniteListInfiniteQuery } from "@/features/destination/destinationApiSlice";
import {
  DestinationFetchError,
  LoadingDestinationList,
} from "./components/fallback";
import { EmptyState } from "@/components/shared/utils";
import useTitle from "@/hooks/useTitle";

const DestinationPage = () => {
  useTitle("tourtoise - let's find your next tour destination");
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

  const handleLoadMoreDestinations = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
            />
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

    </section>
  );
};

export default DestinationPage;
