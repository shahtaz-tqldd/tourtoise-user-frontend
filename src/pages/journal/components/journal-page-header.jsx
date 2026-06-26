import React from "react";

import ListingHeader from "@/components/shared/listing-header";
import SearchField from "@/components/shared/search";

import { SavedJournalsDrawer } from "./saved-journals";

const JournalPageHeader = ({
  searchQuery,
  onSearchChange,
  savedJournals,
  onSaveToggle,
  hasMoreSaved,
  isSavedLoading,
  isFetchingMoreSaved,
  isSavedError,
  onRetrySaved,
  onLoadMoreSaved,
  savedSearchQuery,
  onSavedSearchChange,
}) => (
  <ListingHeader
    title="Travel Journal"
    filters={
      <div className="flex w-full gap-3 md:justify-end">
        <SearchField
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange("")}
          placeholder="Search journals..."
          className="max-w-sm flex-1"
        />
        <SavedJournalsDrawer
          journals={savedJournals}
          onSaveToggle={onSaveToggle}
          hasMore={hasMoreSaved}
          isLoading={isSavedLoading}
          isFetchingMore={isFetchingMoreSaved}
          isError={isSavedError}
          onRetry={onRetrySaved}
          onLoadMore={onLoadMoreSaved}
          searchQuery={savedSearchQuery}
          onSearchChange={onSavedSearchChange}
        />
      </div>
    }
  />
);

export default JournalPageHeader;
