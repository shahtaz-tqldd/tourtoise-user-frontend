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

const getDestinationRows = (response) => {
  const payload = response?.data || response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getDestinationCount = (response, rows) => {
  const payload = response?.data || response;

  return (
    response?.meta?.count ||
    response?.meta?.total ||
    payload?.count ||
    payload?.total ||
    rows.length
  );
};

const getDestinationFromSavedRow = (row) =>
  row?.destination || row?.destination_detail || row?.destination_data || row;

const DestinationPage = () => {
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

  const { data, isFetching, isError } =
    useDestinationListQuery(destinationQuery);
  const { data: savedData, isFetching: isSavedFetching } =
    useSaveDestinationListQuery({
      page: 1,
      pageSize: 6,
    });
  const destinations = useMemo(() => getDestinationRows(data), [data]);
  const totalDestinations = getDestinationCount(data, destinations);
  const savedDestinations = useMemo(
    () =>
      getDestinationRows(savedData)
        .map(getDestinationFromSavedRow)
        .filter((destination) => destination?.slug)
        .slice(0, 4),
    [savedData],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setCountries([]);
    setDestinationTypes([]);
    setBudgetTiers([]);
    setDifficulties([]);
  };

  return (
    <section className="grid gap-10 pt-5 pb-20 md:pb-5 lg:grid-cols-[minmax(0,1fr)_372px]">
      <div className="space-y-8">
        <ListingHeader
          title="Where's Next?"
          description={`Showing ${destinations.length} of ${totalDestinations} destinations`}
          filters={
            <DestinationFilter
              totalDestinations={totalDestinations}
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
          <EmptyDestinationList />
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
