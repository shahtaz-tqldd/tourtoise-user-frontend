import { useCallback, useMemo, useState } from "react";
import { MapPinOff } from "lucide-react";

import EmptyPage from "@/components/shared/empty-page";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import ListingHeader from "@/components/shared/listing-header";
import DestinationCard from "./components/destination-card";
import DestinationFilter from "./components/destination-filter";
import { useDestinationInfiniteListInfiniteQuery } from "@/features/destination/destinationApiSlice";
import {
  DestinationFetchError,
  LoadingDestinationList,
} from "./components/fallback";
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
  const hasActiveFilters = Boolean(
    searchQuery ||
    countries.length ||
    destinationTypes.length ||
    budgetTiers.length ||
    difficulties.length,
  );

  const handleLoadMoreDestinations = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] flex-col pt-5 pb-20 md:pb-5">
      <div className="flex min-h-0 flex-1 flex-col gap-8">
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

        {destinations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
              />
            ))}
          </div>
        )}

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
          <EmptyPage
            icon={MapPinOff}
            eyebrow={
              hasActiveFilters ? "No matching places" : "More places coming soon"
            }
            title={
              hasActiveFilters
                ? "No destinations found"
                : "No destinations available"
            }
            description={
              hasActiveFilters
                ? "No destinations match your current search or filters. Try broadening your choices."
                : "New destinations will appear here as soon as they are ready to explore."
            }
            actionLabel={hasActiveFilters ? "Clear filters" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
            className="min-h-0 flex-1 sm:min-h-0"
          />
        )}
      </div>
    </section>
  );
};

export default DestinationPage;
