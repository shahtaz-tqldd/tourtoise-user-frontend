import React from "react";
import { Plus, Search } from "lucide-react";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import { UserAvatar } from "@/components/shared/user-profile";
import { Button } from "@/components/ui/button";

import JournalCard from "./journal-card";

const JournalListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="h-64 animate-pulse rounded-3xl bg-slate-100"
      />
    ))}
  </div>
);

const CreateJournalTrigger = ({ onCreate }) => (
  <button type="button" className="flex w-full cursor-pointer gap-2" onClick={onCreate}>
    <UserAvatar className="size-9" />
    <div className="flex w-full flex-1 items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-slate-400">
      <Plus size={14} />
      <span className="text-sm">Write Journal</span>
    </div>
  </button>
);

const JournalFeed = ({
  journals,
  isLoading,
  isSearchSettling,
  isError,
  onRetry,
  hasFilters,
  onClearFilters,
  hasMore,
  isFetchingMore,
  onLoadMore,
  onCreate,
  onSaveToggle,
  onEditJournal,
  onDeleteJournal,
  canManageJournal,
}) => (
  <>
    <CreateJournalTrigger onCreate={onCreate} />

    {isLoading || isSearchSettling ? (
      <JournalListSkeleton />
    ) : isError ? (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-semibold text-red-700">
          Could not load travel journals.
        </p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    ) : journals.length > 0 ? (
      <div className="space-y-6 md:space-y-4">
        {journals.map((journal) => (
          <JournalCard
            key={journal.id}
            journal={journal}
            isSaved={journal.is_saved}
            onSaveToggle={onSaveToggle}
            onEdit={canManageJournal(journal) ? onEditJournal : undefined}
            onDelete={canManageJournal(journal) ? onDeleteJournal : undefined}
          />
        ))}
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isFetchingMore}
          onLoadMore={onLoadMore}
          loadingLabel="Loading more journals..."
        />
      </div>
    ) : (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Search size={24} />
        </div>
        <h2 className="mt-5 text-lg font-bold text-slate-950">
          No journals found
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Adjust the search or tag filter to browse more travel stories.
        </p>
        {hasFilters && (
          <Button className="mt-4" variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    )}
  </>
);

export default JournalFeed;
