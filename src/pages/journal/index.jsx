import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// components
import JournalFeed from "./components/journal-feed";
import JournalPageHeader, {
  JournalComposerPrompt,
  JournalScopeTabs,
} from "./components/journal-page-header";
import JournalSidebar from "./components/journal-sidebar";
import ConfirmDialog from "@/components/shared/confirm-dialog";

import {
  useDeleteJournalMutation,
  useJournalInfiniteListInfiniteQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { JOURNAL_SCOPES, normalizeJournals } from "./journal-utils";
import useTitle from "@/hooks/useTitle";
import JournalFormDialog from "./components/journal-form-dialog";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { Container } from "@/components/ui/container";

const TravelJournalPage = () => {
  useTitle("tourtoise - travel journal");
  const navigate = useNavigate();
  const { requireAuth, isAuthenticated } = useAuthGate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [deletingJournal, setDeletingJournal] = useState(null);
  const requestedScope = searchParams.get("view");
  // Guests only ever see the community feed.
  const journalScope =
    isAuthenticated && JOURNAL_SCOPES.some(({ value }) => value === requestedScope)
      ? requestedScope
      : "public";
  const currentUser = useSelector((state) => state.auth.user);
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
    scope: journalScope,
  });
  const [saveJournal, { isLoading: isSaving }] = useSaveJournalMutation();
  const [deleteJournal, { isLoading: isDeleting }] = useDeleteJournalMutation();

  useEffect(() => {
    const journalId = window.location.hash.match(/^#journal-(.+)$/)?.[1];
    if (journalId) {
      navigate(`/travel-journal/${journalId}`, { replace: true });
    }
  }, [navigate]);

  const journals = useMemo(
    () =>
      normalizeJournals(data?.pages.flatMap((page) => page.data)).map((journal) =>
        // The saved list may omit `is_saved`; everything in it is saved.
        journalScope === "saved" ? { ...journal, is_saved: journal.is_saved ?? true } : journal,
      ),
    [data, journalScope],
  );

  const toggleSavedJournal = (journal) => {
    if (!journal?.id || isSaving) return;

    requireAuth(() => handleSaveJournal(journal), { reason: "journal" });
  };

  const handleSaveJournal = async (journal) => {
    try {
      const response = await saveJournal({
        journal_id: journal.id,
        saved: journal.is_saved,
      }).unwrap();
      toast.success(
        response?.message ||
          (journal.is_saved
            ? "Journal removed from saved items."
            : "Journal saved."),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this journal."));
    }
  };

  const changeScope = (scope) =>
    setSearchParams(
      (params) => {
        if (scope === "public") params.delete("view");
        else params.set("view", scope);
        return params;
      },
      { replace: true },
    );

  const openCreate = () => {
    requireAuth(() => {
      setEditingJournal(null);
      setFormOpen(true);
    }, { reason: "journal" });
  };

  const openEdit = (journal) => {
    requireAuth(() => {
      setEditingJournal(journal);
      setFormOpen(true);
    }, { reason: "journal" });
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

  return (
    <Container>
      {/* Feed capped at a comfortable reading width; the sidebar takes the rest. */}
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,780px)_minmax(320px,1fr)]">
        <div className="min-w-0 space-y-4">
          <JournalPageHeader />
          {isAuthenticated && (
            <JournalScopeTabs value={journalScope} onValueChange={changeScope} />
          )}
          {/* Desktop shows the composer in the sidebar instead. */}
          <JournalComposerPrompt onCreate={openCreate} className="lg:hidden" />
          <JournalFeed
            journals={journals}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            hasMore={hasNextPage}
            isFetchingMore={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            onSaveToggle={toggleSavedJournal}
            onEditJournal={openEdit}
            onDeleteJournal={setDeletingJournal}
            canManageJournal={isOwnJournal}
            scope={journalScope}
            onCreate={openCreate}
            emptyDescription={
              {
                mine: "Write about a trip you loved — it only takes a minute.",
                saved: "Tap Save on any post to keep it here for your next trip.",
              }[journalScope] || "Be the first to share a story from the road."
            }
          />
        </div>
        <JournalSidebar onCreate={openCreate} />
      </div>
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
        title="Delete post?"
        description="This permanently deletes the post and all its comments."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteJournal}
      />
    </Container>
  );
};

export default TravelJournalPage;
