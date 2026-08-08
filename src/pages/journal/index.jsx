import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// components
import JournalFeed from "./components/journal-feed";
import JournalPageHeader from "./components/journal-page-header";
import ConfirmDialog from "@/components/shared/confirm-dialog";

import {
  useDeleteJournalMutation,
  useJournalInfiniteListInfiniteQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { normalizeJournals } from "./journal-utils";
import useTitle from "@/hooks/useTitle";
import JournalFormDialog from "./components/journal-form-dialog";

const TravelJournalPage = () => {
  useTitle("tourtoise - travel journal");
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [deletingJournal, setDeletingJournal] = useState(null);
  const [journalScope, setJournalScope] = useState("public");
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
    () => normalizeJournals(data?.pages.flatMap((page) => page.data)),
    [data],
  );

  const toggleSavedJournal = async (journal) => {
    if (!journal?.id || isSaving) return;

    try {
      const response = await saveJournal({
        journal_id: journal.id,
        saved: journal.is_saved,
      }).unwrap();
      toast.success(
        response?.message ||
          (journal.is_saved ? "Journal removed from saved items." : "Journal saved."),
      );
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

  return (
    <section className="mx-auto max-w-3xl pt-5 pb-20 md:pb-5">
      <div className="min-w-0 space-y-5">
        <JournalPageHeader
          onCreate={openCreate}
          journalScope={journalScope}
          onJournalScopeChange={setJournalScope}
        />

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
          emptyDescription={
            journalScope === "mine"
              ? "Create your first travel journal to see it here."
              : "No public travel journals are available yet."
          }
        />
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
