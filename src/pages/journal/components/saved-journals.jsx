import React from "react";
import { Bookmark, BookMarked, BookmarkX, X } from "lucide-react";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import SearchField from "@/components/shared/search";
import { SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const getJournalCover = (journal) =>
  journal.images?.[0] || journal.cover_image || null;

const SavedJournalList = ({
  journals,
  onSaveToggle,
  isLoading,
  isError,
  onRetry,
  searchQuery,
  onClearSearch,
}) => {
  if (isLoading && !journals.length) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-6 py-10 text-center">
        <h3 className="text-base font-semibold text-red-700">
          Could not load saved journals
        </h3>
        <p className="mx-auto mt-1 max-w-[260px] text-sm leading-6 text-red-600/80">
          There was a problem loading your bookmarked travel stories.
        </p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!journals.length) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <div className="center size-12 rounded-xl bg-primary/10 text-primary">
          <BookmarkX size={20} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-950">
          {searchQuery ? "No saved journals found" : "No saved journals yet"}
        </h3>
        <p className="mt-1 max-w-[260px] text-sm leading-6 text-slate-500">
          {searchQuery
            ? "Try another search term to find a bookmarked travel story."
            : "Save journals you want to revisit and they will show up here."}
        </p>
        {searchQuery && (
          <Button className="mt-4" variant="outline" onClick={onClearSearch}>
            Clear search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {journals.map((journal) => {
        const coverImage = getJournalCover(journal);

        return (
          <article
            key={journal.id}
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-2xl bg-white",
              coverImage ? "p-3" : "p-4",
            )}
          >
            {coverImage ? (
              <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                {journal.body || "Untitled travel journal"}
              </p>
              <div className="mt-3 flx gap-2">
                <img
                  src={journal.author?.avatar_url}
                  className="size-8 rounded-full object-cover"
                  alt={journal.author.name}
                />
                <div>
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {journal.author?.name || "Unknown traveler"}
                  </p>
                  {journal.date && (
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {journal.date}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-primary"
              onClick={() => onSaveToggle(journal)}
              aria-label="Remove journal from saved journals"
            >
              <Bookmark size={16} className="fill-current" />
            </Button>
          </article>
        );
      })}
    </div>
  );
};

export const SavedJournalsPanel = ({
  journals,
  onSaveToggle,
  hasMore,
  isLoading,
  isFetchingMore,
  isError,
  onRetry,
  onLoadMore,
  searchQuery,
  onSearchChange,
}) => (
  <aside className="custom-scrollbar hidden max-h-[calc(100vh-7rem)] space-y-10 overflow-y-auto pr-2 lg:sticky lg:top-24 lg:block lg:self-start">
    <div className="space-y-5">
      <SectionHeader
        icon={BookMarked}
        title="Saved Journals"
        description="Bookmarked travel stories"
      />

      <SearchField
        value={searchQuery}
        onChange={onSearchChange}
        onClear={() => onSearchChange("")}
        placeholder="Search saved journals..."
      />
      <SavedJournalList
        journals={journals}
        onSaveToggle={onSaveToggle}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        searchQuery={searchQuery}
        onClearSearch={() => onSearchChange("")}
      />
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={isFetchingMore}
        onLoadMore={onLoadMore}
        loadingLabel="Loading saved journals..."
      />
    </div>
  </aside>
);

export const SavedJournalsDrawer = ({
  journals,
  onSaveToggle,
  hasMore,
  isLoading,
  isFetchingMore,
  isError,
  onRetry,
  onLoadMore,
  searchQuery,
  onSearchChange,
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-12 rounded-full border-slate-200 lg:hidden"
        aria-label="Open saved journals"
      >
        <Bookmark size={16} />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="w-[min(92vw,400px)] gap-0 overflow-y-auto p-0"
      showCloseButton={false}
    >
      <SheetHeader className="border-b border-slate-100 pr-12 text-left">
        <SheetTitle>Saved Journals</SheetTitle>
        <SheetDescription>Your bookmarked travel stories.</SheetDescription>
      </SheetHeader>
      <SheetClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-3 top-3 rounded-full"
          aria-label="Close saved journals"
        >
          <X size={16} />
        </Button>
      </SheetClose>
      <div className="space-y-8 p-4">
        <SearchField
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange("")}
          placeholder="Search saved journals..."
        />
        <SavedJournalList
          journals={journals}
          onSaveToggle={onSaveToggle}
          isLoading={isLoading}
          isError={isError}
          onRetry={onRetry}
          searchQuery={searchQuery}
          onClearSearch={() => onSearchChange("")}
        />
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isFetchingMore}
          onLoadMore={onLoadMore}
          loadingLabel="Loading saved journals..."
        />
      </div>
    </SheetContent>
  </Sheet>
);
