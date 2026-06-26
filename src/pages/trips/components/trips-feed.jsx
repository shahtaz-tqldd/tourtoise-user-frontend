import React from "react";

import { EmptyState } from "@/components/shared/utils";

import TripCard from "./trip-card";
import TripListLoader from "./trip-list-loader";

const TripsFeed = ({
  trips,
  isFetching,
  isError,
  hasActiveFilters,
  onClearFilters,
}) => (
  <>
    {isFetching && <TripListLoader />}

    {isError && !isFetching && (
      <EmptyState
        title="Could not load active trips"
        description="Check the trips endpoint and try again."
      />
    )}

    {!isFetching && !isError && trips.length > 0 && (
      <div className="space-y-4">
        {trips.map((trip) => (
          <TripCard key={trip.id || trip.slug} trip={trip} />
        ))}
      </div>
    )}

    {!isFetching && !isError && !trips.length && (
      <EmptyState
        title="No active trips"
        description={
          hasActiveFilters
            ? "No current trips match the search and status filter."
            : "Start planning from a destination page and active trips or drafts will appear here."
        }
        onClear={hasActiveFilters ? onClearFilters : undefined}
      />
    )}
  </>
);

export default TripsFeed;
