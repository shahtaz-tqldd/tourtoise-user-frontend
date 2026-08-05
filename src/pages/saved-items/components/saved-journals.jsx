import { useCallback, useMemo, useState } from "react";
import { Bookmark, BookmarkX, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/confirm-dialog";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import { EmptyState } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import {
  useSavedJournalInfiniteListInfiniteQuery,
  useSaveJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn, getCloudinaryPreviewUrl } from "@/lib/utils";
import { normalizeJournals } from "@/pages/journal/journal-utils";

const PAGE_SIZE = 12;

const getJournalCover = (journal) =>
  journal.images?.[0] || journal.cover_image || null;

const SavedJournal = ({ className = "" }) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSavedJournalInfiniteListInfiniteQuery({ page_size: PAGE_SIZE });
  const [saveJournal, { isLoading: isRemoving }] = useSaveJournalMutation();
  const [journalToRemove, setJournalToRemove] = useState(null);

  const journals = useMemo(
    () =>
      normalizeJournals(data?.pages?.flatMap((page) => page?.data ?? []) ?? []),
    [data],
  );
  const isInitialLoading = isLoading || (isFetching && !data?.pages?.length);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const removeJournal = async () => {
    if (!journalToRemove?.id || isRemoving) return;

    try {
      const response = await saveJournal({
        journal_id: journalToRemove.id,
        saved: true,
      }).unwrap();
      toast.success(response?.message || "Journal removed from saved items.");
      setJournalToRemove(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not remove this journal."));
    }
  };

  if (isInitialLoading) return <JournalSkeleton />;

  if (isError && !journals.length) {
    return (
      <FetchError
        title="Could not load saved journals"
        description="We could not retrieve your bookmarked travel stories. Check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  if (!journals.length) {
    return (
      <EmptyState
        title="No saved journals"
        description="Travel stories you bookmark will appear here."
        className="min-h-72 py-16 sm:py-20"
      />
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {journals.map((journal, index) => (
          <JournalItem
            key={journal.id || index}
            journal={journal}
            isRemoving={isRemoving && journalToRemove?.id === journal.id}
            onRemove={() => setJournalToRemove(journal)}
          />
        ))}
      </div>

      {isError ? (
        <FetchError
          compact
          title="Could not load more journals"
          description="Your saved journals above are still available."
          onRetry={refetch}
        />
      ) : (
        <InfiniteScroll
          hasMore={Boolean(hasNextPage)}
          isLoading={isFetchingNextPage}
          onLoadMore={loadMore}
          loadingLabel="Loading more saved journals..."
        />
      )}

      <ConfirmDialog
        open={Boolean(journalToRemove)}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setJournalToRemove(null);
        }}
        title="Remove saved journal?"
        description="Remove this journal from your saved items? You can save it again later."
        confirmLabel="Remove"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={removeJournal}
      />
    </div>
  );
};

const JournalItem = ({ journal, isRemoving, onRemove }) => {
  const coverImage = getJournalCover(journal);
  const authorName = journal.author?.name || "Unknown traveler";
  const authorImage = journal.author?.avatar_url;

  return (
    <article className="relative flex min-w-0 w-full overflow-hidden rounded-2xl bg-white transition hover:shadow-md">
      <Link
        to={`/travel-journal/${journal.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 p-3 pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:gap-4 sm:p-4 sm:pr-14"
      >
        {coverImage ? (
          <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-24">
            <img
              src={getCloudinaryPreviewUrl(coverImage, 360)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm leading-5 text-slate-600 sm:leading-6">
            {journal.body || journal.title || "Untitled travel journal"}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <img
              src={getCloudinaryPreviewUrl(authorImage, 60)}
              className="size-7 rounded-full object-cover"
              alt={authorName}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {authorName}
              </p>
              {journal.date ? (
                <p className="truncate text-xs text-slate-400">
                  {journal.date}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 bottom-2 z-10 rounded-full text-primary hover:bg-red-50 hover:text-red-600 sm:right-3 sm:bottom-3"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label="Remove journal from saved items"
      >
        {isRemoving ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Bookmark size={17} className="fill-current" />
        )}
      </Button>
    </article>
  );
};

const JournalSkeleton = () => (
  <div
    className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
    aria-label="Loading saved journals"
    aria-busy="true"
  >
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/60 sm:gap-4 sm:p-4"
      >
        <div className="size-20 shrink-0 animate-pulse rounded-xl bg-slate-200 sm:size-24" />
        <div className="min-w-0 flex-1 space-y-3 py-1">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const FetchError = ({ title, description, onRetry, compact = false }) => (
  <div
    role="alert"
    className={cn(
      "rounded-2xl border border-dashed border-red-200 bg-red-50 px-5 text-center",
      compact ? "py-5" : "py-10 sm:px-8",
    )}
  >
    <h2 className="font-semibold text-red-700">{title}</h2>
    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-red-600/80">
      {description}
    </p>
    <Button className="mt-4" variant="outline" onClick={() => void onRetry()}>
      Try again
    </Button>
  </div>
);

export default SavedJournal;
