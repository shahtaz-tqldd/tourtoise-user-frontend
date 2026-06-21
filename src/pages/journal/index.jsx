import React, { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkX,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";

import AgentMessageComposer from "@/components/shared/agent-message-composer";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import ListingHeader from "@/components/shared/listing-header";
import SearchField from "@/components/shared/search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useJournalInfiniteListInfiniteQuery,
  useSavedJournalInfiniteListInfiniteQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import JournalCard from "./journal-card";
import { normalizeJournals } from "./journal-utils";
import { JournalFormDialog } from "../profile/travel_journal";

const JournalTagFilter = ({ tags, value, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draftTag, setDraftTag] = useState(value);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setDraftTag(value);
    setOpen(nextOpen);
  };

  const applyFilter = () => {
    onApply(draftTag);
    setOpen(false);
  };

  const cancelFilter = () => {
    setDraftTag(value);
    setOpen(false);
  };

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-slate-200"
            aria-label="Open journal filters"
          >
            <SlidersHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(calc(100vw-2rem),340px)] rounded-2xl border-slate-200 bg-white p-0 shadow-xl"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-base font-bold text-slate-950">
              Filter journals
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a journal tag to show.
            </p>
          </div>

          <div className="max-h-[52vh] space-y-2 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Tag
            </p>
            {tags.map((tag) => (
              <label
                key={tag}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition",
                  draftTag === tag
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="journal-tag-filter"
                  value={tag}
                  checked={draftTag === tag}
                  onChange={(event) => setDraftTag(event.target.value)}
                  className="size-4 accent-primary"
                />
                {tag}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
            <Button type="button" variant="outline" onClick={cancelFilter}>
              Cancel
            </Button>
            <Button type="button" onClick={applyFilter}>
              Apply
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {value !== "All" && (
        <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary" />
      )}
    </div>
  );
};

const getJournalCover = (journal) =>
  journal.images?.[0] || journal.cover_image || null;

const SavedJournalList = ({
  journals: savedJournals,
  onSaveToggle,
  isLoading,
}) => {
  if (isLoading && !savedJournals.length) {
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

  if (!savedJournals.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="center size-12 rounded-full bg-slate-200/80">
          <BookmarkX className="text-slate-500" />
        </div>
        <p className="max-w-[240px] text-sm leading-5 text-slate-500">
          You have no saved journals yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedJournals.map((journal) => {
        const coverImage = getJournalCover(journal);

        return (
          <article
            key={journal.id}
            className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-2"
          >
            <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {coverImage && (
                <img
                  src={coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm leading-5 text-slate-700">
                {journal.body}
              </p>
              <p className="mt-1.5 truncate text-xs font-semibold text-slate-500">
                {journal.author.name}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {journal.date}
              </p>
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

const SavedJournalsPanel = ({
  journals: savedJournals,
  onSaveToggle,
  hasMore,
  isLoading,
  onLoadMore,
}) => (
  <aside className="custom-scrollbar hidden max-h-[calc(100vh-7rem)] space-y-10 overflow-y-auto pr-2 lg:sticky lg:top-24 lg:block lg:self-start">
    <AgentMessageComposer
      message="Found a travel story you like? I can help turn its ideas into your own trip plan."
      placeholder="Ask about a journal or travel idea"
    />
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        <Bookmark size={14} />
        Saved journals
      </div>
      <SavedJournalList
        journals={savedJournals}
        onSaveToggle={onSaveToggle}
        isLoading={isLoading}
      />
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        loadingLabel="Loading saved journals..."
      />
    </div>
  </aside>
);

const SavedJournalsDrawer = ({
  journals: savedJournals,
  onSaveToggle,
  hasMore,
  isLoading,
  onLoadMore,
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
        <AgentMessageComposer
          message="Found a travel story you like? I can help turn its ideas into your own trip plan."
          placeholder="Ask about a journal or travel idea"
        />
        <SavedJournalList
          journals={savedJournals}
          onSaveToggle={onSaveToggle}
          isLoading={isLoading}
        />
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={onLoadMore}
          loadingLabel="Loading saved journals..."
        />
      </div>
    </SheetContent>
  </Sheet>
);

const TravelJournalPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useJournalInfiniteListInfiniteQuery({
    page_size: 10,
    search: searchQuery.trim(),
    tags: activeTag === "All" ? undefined : activeTag,
  });
  const {
    data: savedData,
    fetchNextPage: fetchNextSavedPage,
    hasNextPage: hasNextSavedPage,
    isLoading: isLoadingSaved,
    isFetchingNextPage: isFetchingNextSavedPage,
  } = useSavedJournalInfiniteListInfiniteQuery({ page_size: 10 });
  const [saveJournal, { isLoading: isSaving }] = useSaveJournalMutation();

  const journals = useMemo(
    () => normalizeJournals(data?.pages.flatMap((page) => page.data)),
    [data],
  );
  const savedJournals = useMemo(
    () =>
      normalizeJournals(savedData?.pages.flatMap((page) => page.data)),
    [savedData],
  );
  const totalJournals = data?.pages[0]?.meta?.count || 0;

  const tags = useMemo(
    () => [
      "All",
      ...new Set([
        ...(activeTag === "All" ? [] : [activeTag]),
        ...journals.flatMap((journal) => journal.tags || []),
        ...savedJournals.flatMap((journal) => journal.tags || []),
      ]),
    ],
    [activeTag, journals, savedJournals],
  );

  const toggleSavedJournal = async (journal) => {
    if (isSaving) return;
    try {
      const response = await saveJournal({
        journal_id: journal.id,
        saved: journal.is_saved,
      }).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this journal."));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTag("All");
  };

  const hasFilters = searchQuery || activeTag !== "All";

  return (
    <section className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div className="min-w-0 space-y-5">
        <ListingHeader
          title="Travel Journal"
          description={`Showing ${journals.length} of ${totalJournals} journals`}
          filters={
            <div className="flex w-full gap-3 md:justify-end">
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Search journals..."
                className="max-w-sm flex-1"
              />
              <JournalTagFilter
                tags={tags}
                value={activeTag}
                onApply={setActiveTag}
              />
              <Button
                type="button"
                className="h-12 shrink-0 rounded-full px-4"
                onClick={() => setFormOpen(true)}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Write Journal</span>
              </Button>
              <SavedJournalsDrawer
                journals={savedJournals}
                onSaveToggle={toggleSavedJournal}
                hasMore={hasNextSavedPage}
                isLoading={isLoadingSaved || isFetchingNextSavedPage}
                onLoadMore={fetchNextSavedPage}
              />
            </div>
          }
        />

        {isLoading ? (
          <JournalListSkeleton />
        ) : isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-semibold text-red-700">
              Could not load travel journals.
            </p>
            <Button className="mt-4" variant="outline" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : journals.length > 0 ? (
          <div className="space-y-12 md:space-y-4">
            {journals.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                isSaved={journal.is_saved}
                onSaveToggle={toggleSavedJournal}
              />
            ))}
            <InfiniteScroll
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLoadMore={fetchNextPage}
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
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      <SavedJournalsPanel
        journals={savedJournals}
        onSaveToggle={toggleSavedJournal}
        hasMore={hasNextSavedPage}
        isLoading={isLoadingSaved || isFetchingNextSavedPage}
        onLoadMore={fetchNextSavedPage}
      />
      {formOpen && (
        <JournalFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          journal={null}
        />
      )}
    </section>
  );
};

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

export default TravelJournalPage;
