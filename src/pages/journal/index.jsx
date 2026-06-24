import React, { useMemo, useState } from "react";
import {
  Bookmark,
  BookMarked,
  BookmarkX,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/confirm-dialog";
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
  useDeleteJournalMutation,
  useJournalInfiniteListInfiniteQuery,
  useSavedJournalInfiniteListInfiniteQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import useDebounce from "@/hooks/useDebounce";
import JournalCard from "./journal-card";
import { normalizeJournals } from "./journal-utils";
import { JournalFormDialog } from "../profile/travel_journal";
import { SectionHeader } from "@/components/shared/utils";
import { UserAvatar } from "@/components/shared/user-profile";

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

const matchesSavedJournalSearch = (journal, searchQuery) => {
  if (!searchQuery) return true;

  const searchableText = [
    journal.body,
    journal.author?.name,
    journal.date,
    ...(journal.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchQuery.toLowerCase());
};

const SavedJournalList = ({
  journals: savedJournals,
  onSaveToggle,
  isLoading,
  isError,
  onRetry,
  searchQuery,
  onClearSearch,
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

  if (!savedJournals.length) {
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
      {savedJournals.map((journal) => {
        const coverImage = getJournalCover(journal);

        return (
          <article
            key={journal.id}
            className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-2"
          >
            <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                  <BookMarked size={22} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm leading-5 text-slate-700">
                {journal.body || "Untitled travel journal"}
              </p>
              <p className="mt-1.5 truncate text-xs font-semibold text-slate-500">
                {journal.author?.name || "Unknown traveler"}
              </p>
              {journal.date && (
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {journal.date}
                </p>
              )}
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
        journals={savedJournals}
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

const SavedJournalsDrawer = ({
  journals: savedJournals,
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
          journals={savedJournals}
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

const TravelJournalPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSearchQuery, setSavedSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [deletingJournal, setDeletingJournal] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 400);
  const debouncedSavedSearchQuery = useDebounce(savedSearchQuery.trim(), 400);
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
    search: debouncedSearchQuery,
    tags: activeTag === "All" ? undefined : activeTag,
  });
  const {
    data: savedData,
    fetchNextPage: fetchNextSavedPage,
    hasNextPage: hasNextSavedPage,
    isLoading: isLoadingSaved,
    isError: isSavedError,
    isFetchingNextPage: isFetchingNextSavedPage,
    refetch: refetchSavedJournals,
  } = useSavedJournalInfiniteListInfiniteQuery({
    page_size: debouncedSavedSearchQuery ? 100 : 10,
    search: debouncedSavedSearchQuery,
  });
  const [saveJournal, { isLoading: isSaving }] = useSaveJournalMutation();
  const [deleteJournal, { isLoading: isDeleting }] = useDeleteJournalMutation();

  const journals = useMemo(
    () => normalizeJournals(data?.pages.flatMap((page) => page.data)),
    [data],
  );
  const savedJournals = useMemo(
    () => normalizeJournals(savedData?.pages.flatMap((page) => page.data)),
    [savedData],
  );
  const filteredSavedJournals = useMemo(
    () =>
      savedJournals.filter((journal) =>
        matchesSavedJournalSearch(journal, debouncedSavedSearchQuery),
      ),
    [debouncedSavedSearchQuery, savedJournals],
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

  const openCreate = () => {
    setEditingJournal(null);
    setFormOpen(true);
  };

  const openEdit = (journal) => {
    setEditingJournal(journal);
    setFormOpen(true);
  };

  const handleDeleteJournal = async () => {
    if (!deletingJournal) return;

    try {
      const response = await deleteJournal(deletingJournal.id).unwrap();
      toast.success(response.message);
      setDeletingJournal(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this journal."));
    }
  };

  const isOwnJournal = (journal) => {
    if (journal.is_mine || journal.is_owner) return true;
    if (!currentUser?.id || !journal.author?.id) return false;

    return String(currentUser.id) === String(journal.author.id);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTag("All");
  };

  const hasFilters = searchQuery || activeTag !== "All";
  const isSavedSearchSettling =
    savedSearchQuery.trim() !== debouncedSavedSearchQuery;
  const isJournalSearchSettling = searchQuery.trim() !== debouncedSearchQuery;

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
              <SavedJournalsDrawer
                journals={filteredSavedJournals}
                onSaveToggle={toggleSavedJournal}
                hasMore={hasNextSavedPage && !debouncedSavedSearchQuery}
                isLoading={isLoadingSaved || isSavedSearchSettling}
                isFetchingMore={isFetchingNextSavedPage}
                isError={isSavedError}
                onRetry={refetchSavedJournals}
                onLoadMore={fetchNextSavedPage}
                searchQuery={savedSearchQuery}
                onSearchChange={setSavedSearchQuery}
              />
            </div>
          }
        />

        <div
          type="button"
          className="flx w-full gap-2 cursor-pointer"
          onClick={openCreate}
        >
          <UserAvatar className="size-9" />
          <div className="flex-1 border rounded-full w-full flex items-center bg-white text-slate-400 py-2.5 px-4 gap-2">
            <Plus size={14} />
            <span className="text-sm">Write Journal</span>
          </div>
        </div>

        {isLoading || isJournalSearchSettling ? (
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
          <div className=" md:space-y-4">
            {journals.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                isSaved={journal.is_saved}
                onSaveToggle={toggleSavedJournal}
                onEdit={isOwnJournal(journal) ? openEdit : undefined}
                onDelete={
                  isOwnJournal(journal) ? setDeletingJournal : undefined
                }
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
        journals={filteredSavedJournals}
        onSaveToggle={toggleSavedJournal}
        hasMore={hasNextSavedPage && !debouncedSavedSearchQuery}
        isLoading={isLoadingSaved || isSavedSearchSettling}
        isFetchingMore={isFetchingNextSavedPage}
        isError={isSavedError}
        onRetry={refetchSavedJournals}
        onLoadMore={fetchNextSavedPage}
        searchQuery={savedSearchQuery}
        onSearchChange={setSavedSearchQuery}
      />
      {formOpen && (
        <JournalFormDialog
          key={editingJournal?.id || "new-journal"}
          open={formOpen}
          onOpenChange={setFormOpen}
          journal={editingJournal}
        />
      )}
      <ConfirmDialog
        open={Boolean(deletingJournal)}
        onOpenChange={(open) => !open && setDeletingJournal(null)}
        title="Delete journal?"
        description="This permanently deletes this journal and all its comments."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteJournal}
      />
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
