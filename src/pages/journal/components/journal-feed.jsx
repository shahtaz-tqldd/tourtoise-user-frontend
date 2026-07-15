import React from "react";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import { Button } from "@/components/ui/button";

import JournalCard from "./journal-card";
import { EmptyState } from "@/components/shared/utils";

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

const JournalFeed = ({
  journals,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isFetchingMore,
  onLoadMore,
  onSaveToggle,
  onEditJournal,
  onDeleteJournal,
  canManageJournal,
}) => (
  <>
    {isLoading ? (
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
        {journals.map((journal, index) => (
          <React.Fragment key={journal.id}>
            <JournalCard
              journal={journal}
              isSaved={journal.is_saved}
              onSaveToggle={onSaveToggle}
              onEdit={canManageJournal(journal) ? onEditJournal : undefined}
              onDelete={
                canManageJournal(journal) ? onDeleteJournal : undefined
              }
            />
            {index < journals.length - 1 && (
              <hr className="border-slate-200 md:hidden" />
            )}
          </React.Fragment>
        ))}
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isFetchingMore}
          onLoadMore={onLoadMore}
          loadingLabel="Loading more journals..."
        />
      </div>
    ) : (
      <EmptyState
        title="No journals found"
        description="Adjust the search or tag filter to browse more travel stories."
      />
    )}
  </>
);

export default JournalFeed;
