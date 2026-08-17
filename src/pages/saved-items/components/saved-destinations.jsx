import { useCallback, useMemo, useState } from "react";
import { Bookmark, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/confirm-dialog";
import EmptyPage from "@/components/shared/empty-page";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import { Image } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import {
  useSaveDestinationInfiniteListInfiniteQuery,
  useSaveDestinationMutation,
} from "@/features/destination/destinationApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/badge";

const PAGE_SIZE = 12;

const SavedDestinations = ({ className = "" }) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSaveDestinationInfiniteListInfiniteQuery({ pageSize: PAGE_SIZE });
  const [saveDestination, { isLoading: isRemoving }] =
    useSaveDestinationMutation();
  const [destinationToRemove, setDestinationToRemove] = useState(null);

  const destinations = useMemo(
    () => data?.pages?.flatMap((page) => page?.data ?? []) ?? [],
    [data],
  );
  const isInitialLoading = isLoading || (isFetching && !data?.pages?.length);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const removeDestination = async () => {
    if (!destinationToRemove?.slug || isRemoving) return;

    try {
      const response = await saveDestination({
        destination_slug: destinationToRemove.slug,
        save: false,
      }).unwrap();
      toast.success(
        response?.message || "Destination removed from saved items.",
      );
      setDestinationToRemove(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not remove this destination."),
      );
    }
  };

  if (isInitialLoading) return <DestinationSkeleton />;

  if (isError && !destinations.length) {
    return (
      <FetchError
        title="Could not load saved destinations"
        description="We could not retrieve your saved places. Check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  if (!destinations.length) {
    return (
      <EmptyPage
        icon={MapPin}
        eyebrow="Your saved places"
        title="No saved destinations"
        description="Destinations you save will appear here, ready for whenever inspiration strikes."
        actionLabel="Explore destinations"
        actionTo="/"
        className="min-h-0 flex-1 sm:min-h-0"
      />
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {destinations.map((destination, index) => (
          <DestinationItem
            key={destination.slug || destination.id || index}
            destination={destination}
            isRemoving={
              isRemoving && destinationToRemove?.slug === destination.slug
            }
            onRemove={() => setDestinationToRemove(destination)}
          />
        ))}
      </div>

      {isError ? (
        <FetchError
          compact
          title="Could not load more destinations"
          description="Your saved destinations above are still available."
          onRetry={refetch}
        />
      ) : (
        <InfiniteScroll
          hasMore={Boolean(hasNextPage)}
          isLoading={isFetchingNextPage}
          onLoadMore={loadMore}
          loadingLabel="Loading more saved destinations..."
        />
      )}

      <ConfirmDialog
        open={Boolean(destinationToRemove)}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setDestinationToRemove(null);
        }}
        title="Remove saved destination?"
        description={`Remove ${destinationToRemove?.name || "this destination"} from your saved items? You can save it again later.`}
        confirmLabel="Remove"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={removeDestination}
      />
    </div>
  );
};

const DestinationItem = ({ destination, isRemoving, onRemove }) => {
  const location = [destination.region, destination.country]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="relative flex min-w-0 w-full overflow-hidden rounded-2xl bg-white transition hover:shadow-md">
      <Link
        to={`/destinations/${destination.slug}`}
        className="flex min-w-0 flex-1 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <div className="size-32 shrink-0 overflow-hidden md:h-32 md:w-40">
          <Image
            src={destination?.cover_image}
            alt={destination?.name}
            width={220}
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1 p-4">
          <h2 className="truncate text-base font-bold text-slate-950">
            {destination.name || "Unnamed destination"}
          </h2>
          <p className="mt-1.5 mb-4 flex min-w-0 items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{location || "Destination"}</span>
          </p>
          <Badge>{destination.destination_type}</Badge>
        </div>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 bottom-2 z-10 rounded-full text-primary hover:bg-red-50 hover:text-red-600 sm:right-3 sm:bottom-3"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remove ${destination.name || "destination"} from saved items`}
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

const DestinationSkeleton = () => (
  <div
    className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
    aria-label="Loading saved destinations"
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

export default SavedDestinations;
