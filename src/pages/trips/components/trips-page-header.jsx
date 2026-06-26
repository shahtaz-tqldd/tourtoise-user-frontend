import React from "react";

import ListingHeader from "@/components/shared/listing-header";
import SearchField from "@/components/shared/search";

import { TripHistoryDrawer } from "./trip-history";
import TripStatusFilter from "./trip-status-filter";

const TripsPageHeader = ({
  tripsCount,
  totalTrips,
  activeSearch,
  onActiveSearchChange,
  activeStatus,
  onActiveStatusChange,
  historyTrips,
  historySearch,
  onHistorySearchChange,
  isHistoryFetching,
  isHistoryError,
}) => (
  <ListingHeader
    title="Trip Plans"
    description={`Showing ${tripsCount} of ${totalTrips} trips`}
    filters={
      <div className="flex w-full gap-3 md:justify-end">
        <SearchField
          value={activeSearch}
          onChange={onActiveSearchChange}
          onClear={() => onActiveSearchChange("")}
          placeholder="Search active trips..."
          className="max-w-sm flex-1"
        />
        <TripStatusFilter value={activeStatus} onApply={onActiveStatusChange} />
        <TripHistoryDrawer
          trips={historyTrips}
          search={historySearch}
          onSearchChange={onHistorySearchChange}
          isFetching={isHistoryFetching}
          isError={isHistoryError}
        />
      </div>
    }
  />
);

export default TripsPageHeader;
