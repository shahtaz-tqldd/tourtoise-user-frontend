import React from "react";

import ListingHeader from "@/components/shared/listing-header";
import { SavedJournalsDrawer } from "./saved-journals";
import { UserAvatar } from "@/components/shared/user-profile";
import { Plus } from "lucide-react";

const JournalPageHeader = ({
  onCreate,
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
        <CreateJournalTrigger onCreate={onCreate} />
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

const CreateJournalTrigger = ({ onCreate }) => (
  <button
    type="button"
    className="max-w-100 flex w-full cursor-pointer gap-2"
    onClick={onCreate}
  >
    <UserAvatar className="size-10" />
    <div className="flex w-full flex-1 items-center gap-2 rounded-full border bg-white px-4 py-3 text-slate-400">
      <Plus size={15} />
      <span className="text-sm">Write Your Travel Journal</span>
    </div>
  </button>
);
export default JournalPageHeader;
