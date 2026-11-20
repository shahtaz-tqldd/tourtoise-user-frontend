import React from "react";
import { PlaneTakeoff } from "lucide-react";

import EmptyPage from "@/components/shared/empty-page";

import TripCard from "./trip-card";
import TripListLoader from "./trip-list-loader";

const TripsFeed = ({
  trips,
  isFetching,
  isError,
  hasActiveFilters,
  onClearFilters,
}) => (
  <div className="h-full">
    {isFetching && <TripListLoader />}

    {isError && !isFetching && (
      <EmptyPage
        icon={PlaneTakeoff}
        eyebrow="Unable to load trips"
        title="Could not load active trips"
        description="Check the trips endpoint and try again."
      />
    )}

    {!isFetching && !isError && trips.length > 0 && (
      <div className="flex flex-col gap-5">
        {trips.map((trip, idx) => (
          <TripCard key={trip?.id || idx} trip={trip} />
        ))}
      </div>
    )}

    {!isFetching && !isError && !trips.length && (
      <EmptyPage
        icon={PlaneTakeoff}
        title="No active trips"
        description={
          hasActiveFilters
            ? "No current trips match the search and status filter."
            : "Start planning from a destination page and active trips or drafts will appear here."
        }
        eyebrow={
          hasActiveFilters ? "No matching journeys" : "Ready when you are"
        }
        actionLabel={
          hasActiveFilters ? "Clear filters" : "Explore destinations"
        }
        actionTo={hasActiveFilters ? undefined : "/"}
        onAction={hasActiveFilters ? onClearFilters : undefined}
      />
    )}
  </div>
);

export default TripsFeed;
