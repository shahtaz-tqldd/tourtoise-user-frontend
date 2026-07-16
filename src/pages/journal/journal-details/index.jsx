import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/utils";
import {
  useJournalDetailQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import useTitle from "@/hooks/useTitle";
import JournalCard from "../components/journal-card";
import { normalizeJournal } from "../journal-utils";

const JournalDetailsSkeleton = () => (
  <div className="mx-auto max-w-3xl py-5">
    <div className="mb-4 h-10 w-28 animate-pulse rounded-full bg-slate-100" />
    <div className="h-[520px] animate-pulse rounded-3xl bg-slate-100" />
  </div>
);

const JournalDetailsPage = () => {
  const { journalId } = useParams();
  useTitle("tourtoise - travel journal");
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
      <section className="mx-auto max-w-3xl py-5">
        <EmptyState
          title="Journal not found"
          description="This travel journal could not be loaded."
          className="mt-4"
        />
        <Button className="mt-4" variant="outline" onClick={refetch}>
          Try again
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl py-5 pb-20 md:pb-5">
      <JournalCard
        journal={journal}
        isSaved={journal.is_saved}
        onSaveToggle={toggleSavedJournal}
        fullStory
        defaultShowComments
        showRepliesByDefault
      />
    </section>
  );
};

const BackLink = () => (
  <Link
    to="/travel-journal"
    className="mb-4 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
  >
    <ArrowLeft size={16} />
    Back
  </Link>
);

export default JournalDetailsPage;
