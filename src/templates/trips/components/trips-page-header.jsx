import React from "react";

import ListingHeader from "@/components/shared/listing-header";

import { TripHistoryDrawer } from "./trip-history";
import TripStatusFilter from "./trip-status-filter";
import SearchBar from "@/components/shared/search-bar";

const TripsPageHeader = ({
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
    title="My Trips"
    // description="Trip Plan Lists"
    filters={
      <div className="flex w-full gap-1.5 mf:gap-3 md:justify-end">
        <SearchBar
          searchQuery={activeSearch}
          setSearchQuery={onActiveSearchChange}
          placeholder="Search your trips"
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
