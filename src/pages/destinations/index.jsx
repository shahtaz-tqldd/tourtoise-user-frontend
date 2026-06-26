import React, { useMemo, useState } from "react";

import ListingHeader from "@/components/shared/listing-header";
import DestinationCard from "./components/destination-card";
import DestinationFilter from "./components/destination-filter";
import {
  useDestinationListQuery,
  useSaveDestinationListQuery,
} from "@/features/destination/destinationApiSlice";
import { BucketListDrawer, BucketListPanel } from "./components/bucket-list";
import {
  DestinationFetchError,
  EmptyDestinationList,
  LoadingDestinationList,
} from "./components/fallback";

const DestinationPage = () => {
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
  const { data, isFetching, isError } =
    useDestinationListQuery(destinationQuery);
  const destinations = useMemo(() => data?.data || [], [data]);
  const totalDestinations = data?.meta?.count || 0;

  // saved destination
  const { data: savedData, isFetching: isSavedFetching } =
    useSaveDestinationListQuery({
      page: 1,
      pageSize: 6,
    });
  const savedDestinations = useMemo(() => savedData?.data || [], [savedData]);
  const totalSavedDestinations = savedData?.meta?.count || 0;

  return (
    <section className="grid gap-10 pt-5 pb-20 md:pb-5 lg:grid-cols-[minmax(0,1fr)_372px]">
      <div className="space-y-8">
        <ListingHeader
          title="Where's Next?"
          description={`Showing ${destinations.length} of ${totalDestinations} destinations`}
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
                  isFetching={isSavedFetching}
                />
              }
            />
          }
        />

        <div className="grid gap-4 xl:grid-cols-2">
          {destinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>

        {isFetching && <LoadingDestinationList />}

        {isError && !isFetching && <DestinationFetchError />}

        {!isFetching && !isError && !destinations.length && (
          <EmptyDestinationList clearFilters={clearFilters} />
        )}
      </div>

      <BucketListPanel
        savedDestinations={savedDestinations}
        isFetching={isSavedFetching}
        className="hidden lg:block"
      />
    </section>
  );
};

export default DestinationPage;
