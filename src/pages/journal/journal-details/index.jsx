import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import EmptyPage from "@/components/shared/empty-page";
import {
  useJournalDetailQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import useTitle from "@/hooks/useTitle";
import JournalCard from "../components/journal-card";
import { normalizeJournal } from "../journal-utils";
import { Container } from "@/components/ui/container";

const JournalDetailsSkeleton = () => (
  <div className="mx-auto max-w-3xl py-5">
    <div className="mb-4 h-10 w-28 animate-pulse rounded-full bg-slate-100" />
    <div className="h-[520px] animate-pulse rounded-3xl bg-slate-100" />
  </div>
);

const JournalDetailsPage = () => {
  useTitle("tourtoise - travel journal");
  const { journalId } = useParams();
  const { data, isLoading, isError, refetch } =
    useJournalDetailQuery(journalId);
  const [saveJournal, { isLoading: isSaving }] = useSaveJournalMutation();

  const journal = useMemo(() => {
    const payload = data?.data || data;
    return payload ? normalizeJournal(payload) : null;
  }, [data]);

  const toggleSavedJournal = async (currentJournal) => {
    if (isSaving) return;

    try {
      const response = await saveJournal({
        journal_id: currentJournal.id,
        saved: currentJournal.is_saved,
      }).unwrap();
      toast.success(response.message || "Journal updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this journal."));
    }
  };

  if (isLoading) return <JournalDetailsSkeleton />;

  if (isError || !journal) {
    return (
      <Container>
        <EmptyPage
          title="Journal not found"
          description="This travel journal could not be loaded."
          actionLabel="Try again"
          onAction={refetch}
          className="min-h-[60dvh]"
        />
      </Container>
    );
  }

  return (
    <Container childClassName="max-w-3xl">
      <JournalCard
        journal={journal}
        isSaved={journal.is_saved}
        onSaveToggle={toggleSavedJournal}
        fullStory
        defaultShowComments
        showRepliesByDefault
      />
    </Container>
  );
};

export default JournalDetailsPage;
