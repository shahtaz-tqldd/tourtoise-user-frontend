import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// components
import JournalFeed from "./components/journal-feed";
import JournalPageHeader from "./components/journal-page-header";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import { SavedJournalsPanel } from "./components/saved-journals";
import { JournalFormDialog } from "../profile/travel_journal";

// lib
import useDebounce from "@/hooks/useDebounce";
import {
  useDeleteJournalMutation,
  useJournalInfiniteListInfiniteQuery,
  useSavedJournalInfiniteListInfiniteQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { normalizeJournals } from "./journal-utils";

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
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-start pt-5 pb-20 md:pb-5">
      <div className="min-w-0 space-y-5">
        <JournalPageHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          savedJournals={filteredSavedJournals}
          onSaveToggle={toggleSavedJournal}
          hasMoreSaved={hasNextSavedPage && !debouncedSavedSearchQuery}
          isSavedLoading={isLoadingSaved || isSavedSearchSettling}
          isFetchingMoreSaved={isFetchingNextSavedPage}
          isSavedError={isSavedError}
          onRetrySaved={refetchSavedJournals}
          onLoadMoreSaved={fetchNextSavedPage}
          savedSearchQuery={savedSearchQuery}
          onSavedSearchChange={setSavedSearchQuery}
        />

        <JournalFeed
          journals={journals}
          isLoading={isLoading}
          isSearchSettling={isJournalSearchSettling}
          isError={isError}
          onRetry={refetch}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          hasMore={hasNextPage}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          onCreate={openCreate}
          onSaveToggle={toggleSavedJournal}
          onEditJournal={openEdit}
          onDeleteJournal={setDeletingJournal}
          canManageJournal={isOwnJournal}
        />
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

export default TravelJournalPage;
