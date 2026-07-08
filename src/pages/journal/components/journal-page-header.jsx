import React from "react";

import ListingHeader from "@/components/shared/listing-header";
import SearchBar from "@/components/shared/search-bar";
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
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={onSearchChange}
          placeholder="Search Journals"
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
