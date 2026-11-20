"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { Container } from "@/components/ui/container";

const BackLink = () => (
  <Link
    href="/travel-journal"
    className="flx w-fit gap-1.5 rounded-full px-1 text-body-sm font-semibold text-subtle hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <ArrowLeft className="size-4" aria-hidden="true" />
    Travel Journal
  </Link>
);

const JournalDetailsSkeleton = () => (
  <Container childClassName="max-w-2xl gap-4">
    <BackLink />
    <div className="h-[520px] rounded-card bg-surface ring-1 ring-line-subtle motion-safe:animate-pulse" />
  </Container>
);

const JournalDetailsPage = () => {
  useTitle("tourtoise - travel journal");
  const { journalId } = useParams();
  const { requireAuth } = useAuthGate();
  const { data, isLoading, isError, refetch } =
    useJournalDetailQuery(journalId);
  const [saveJournal, { isLoading: isSaving }] = useSaveJournalMutation();

  const journal = useMemo(() => {
    const payload = data?.data || data;
    return payload ? normalizeJournal(payload) : null;
  }, [data]);

  const toggleSavedJournal = (currentJournal) => {
    if (isSaving) return;

    requireAuth(() => handleSaveJournal(currentJournal), {
      reason: "journal",
    });
  };

  const handleSaveJournal = async (currentJournal) => {
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
    <Container childClassName="max-w-2xl gap-4">
      <BackLink />
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
