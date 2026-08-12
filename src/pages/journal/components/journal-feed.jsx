import React from "react";
import { Newspaper } from "lucide-react";

import EmptyPage from "@/components/shared/empty-page";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import { Button } from "@/components/ui/button";

import JournalCard from "./journal-card";

const JournalListSkeleton = () => (
  <div className="space-y-6 md:space-y-4" aria-label="Loading journals">
    {Array.from({ length: 2 }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-none border-transparent bg-transparent md:rounded-3xl md:border md:border-slate-200 md:bg-white md:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3.5 w-28 rounded-full bg-slate-200" />
              <div className="h-2.5 w-20 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="size-9 rounded-full bg-slate-100" />
        </div>

        <div className="mt-4 aspect-[5/3] w-full rounded-2xl bg-slate-200" />

        <div className="mt-4 space-y-2.5">
          <div className="h-3 w-full rounded-full bg-slate-200" />
          <div className="h-3 w-11/12 rounded-full bg-slate-200" />
          <div className="h-3 w-2/3 rounded-full bg-slate-100" />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <div className="h-9 w-20 rounded-full bg-slate-100" />
            <div className="h-9 w-20 rounded-full bg-slate-100" />
            <div className="h-9 w-10 rounded-full bg-slate-100" />
          </div>
          <div className="size-9 rounded-full bg-slate-100" />
        </div>
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
      <EmptyPage
        icon={Newspaper}
        eyebrow={
          scope === "mine" ? "Your travel stories" : "Community stories"
        }
        title={scope === "mine" ? "No journals yet" : "No public journals yet"}
        description={emptyDescription}
        actionLabel="Write a journal"
        onAction={onCreate}
        className="min-h-0 flex-1 sm:min-h-0"
      />
    )}
  </div>
);

export default JournalFeed;
