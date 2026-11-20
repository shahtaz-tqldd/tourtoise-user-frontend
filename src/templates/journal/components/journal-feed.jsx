import React from "react";
import { Newspaper } from "lucide-react";

import EmptyPage from "@/components/shared/empty-page";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import { Button } from "@/components/ui/button";

import JournalCard from "./journal-card";

const JournalListSkeleton = () => (
  <div className="space-y-4" role="status" aria-label="Loading journals">
    {[0, 1].map((index) => (
      <div
        key={index}
        className="overflow-hidden rounded-card bg-surface ring-1 ring-line-subtle motion-safe:animate-pulse"
      >
        <div className="flex items-center gap-3 p-4">
          <div className="size-10 rounded-full bg-ink-200/70" />
          <div className="space-y-2">
            <div className="h-3.5 w-28 rounded-full bg-ink-200/70" />
            <div className="h-2.5 w-16 rounded-full bg-ink-100" />
          </div>
        </div>
        <div className="space-y-2.5 px-4 pb-4">
          <div className="h-4 w-2/3 rounded-full bg-ink-200/70" />
          <div className="h-3 w-full rounded-full bg-ink-100" />
          <div className="h-3 w-5/6 rounded-full bg-ink-100" />
        </div>
        <div className="aspect-[4/3] bg-ink-100" />
        <div className="h-14" />
      </div>
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
  emptyDescription,
  scope,
  onCreate,
}) => (
  <div className="flex h-full min-h-0 flex-col">
    {isLoading ? (
      <JournalListSkeleton />
    ) : isError ? (
      <div className="rounded-card bg-surface p-8 text-center ring-1 ring-line-subtle">
        <p className="text-body-sm font-semibold text-heading">
          Could not load travel journals.
        </p>
        <Button className="mt-4 rounded-full" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    ) : journals.length > 0 ? (
      <div className="space-y-4">
        {journals.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              isSaved={journal.is_saved}
              onSaveToggle={onSaveToggle}
              onEdit={canManageJournal(journal) ? onEditJournal : undefined}
              onDelete={
                canManageJournal(journal) ? onDeleteJournal : undefined
              }
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
      <EmptyPage
        icon={Newspaper}
        eyebrow={
          { mine: "Your travel stories", saved: "Saved posts" }[scope] ||
          "Community stories"
        }
        title={
          { mine: "You haven't posted yet", saved: "Nothing saved yet" }[scope] ||
          "No stories yet"
        }
        description={emptyDescription}
        actionLabel={scope === "saved" ? undefined : "Write a post"}
        onAction={scope === "saved" ? undefined : onCreate}
        className="min-h-0 flex-1 sm:min-h-0"
      />
    )}
  </div>
);

export default JournalFeed;
