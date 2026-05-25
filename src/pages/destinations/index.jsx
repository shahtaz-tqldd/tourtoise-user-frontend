import { Button } from "@/components/ui/button";
import React, { useMemo, useState } from "react";
import DestinationCard from "./components/destination-card";
import DestinationFilter from "./filters";
import { useDestinationListQuery } from "@/features/destination/destinationApiSlice";

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

const DestiantionPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [country, setCountry] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [budgetTier, setBudgetTier] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const destinationQuery = useMemo(
    () => ({
      page: 1,
      page_size: 12,
      search: searchQuery || undefined,
      destination_type: destinationType || undefined,
      country_code: country || undefined,
      budget_tier: budgetTier || undefined,
      difficulty: difficulty || undefined,
    }),
    [budgetTier, country, destinationType, difficulty, searchQuery],
  );

  const { data, isFetching, isError } =
    useDestinationListQuery(destinationQuery);
  const destinations = useMemo(() => getDestinationRows(data), [data]);
  const totalDestinations = getDestinationCount(data, destinations);

  const clearFilters = () => {
    setSearchQuery("");
    setCountry("");
    setDestinationType("");
    setBudgetTier("");
    setDifficulty("");
  };

  return (
    <section className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Find your next travel destination
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Browse listed destinations and start planning your next trip
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {destinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>

        {isFetching && (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              Loading destinations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fetching published destinations from the API.
            </p>
          </div>
        )}

        {isError && !isFetching && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-red-900">
              Could not load destinations
            </h2>
            <p className="mt-1 text-sm text-red-700">
              Check the API base URL, endpoint path, and whether published
              destinations exist.
            </p>
          </div>
        )}

        {!isFetching && !isError && !destinations.length && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              No destinations found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Adjust the search, country, or destination type filters.
            </p>
            <Button className="mt-4" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <DestinationFilter
        totalDestinations={totalDestinations}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        country={country}
        setCountry={setCountry}
        destinationType={destinationType}
        setDestinationType={setDestinationType}
        budgetTier={budgetTier}
        setBudgetTier={setBudgetTier}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        clearFilters={clearFilters}
      />
    </section>
  );
};

export default DestiantionPage;
