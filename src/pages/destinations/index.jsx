import { useCallback, useMemo, useState } from "react";
import { MapPinOff } from "lucide-react";

import EmptyPage from "@/components/shared/empty-page";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { useDestinationInfiniteListInfiniteQuery } from "@/features/destination/destinationApiSlice";
import useTitle from "@/hooks/useTitle";
import { cn } from "@/lib/utils";
import JourneyHero from "./components/journey-hero";
import DestinationCard from "./components/destination-card";
import CompanionStrip from "./components/companion-strip";
import {
  DestinationFetchError,
  LoadingDestinationList,
} from "./components/fallback";
import { DESTINATION_CHIP_OPTIONS, DESTINATION_GRID_CLASS } from "./constants";

const PAGE_SIZE = 24;

const TypeChips = ({ value, onChange }) => (
  <div
    role="group"
    aria-label="Filter destinations by type"
    className="-mx-2.5 flex gap-2 overflow-x-auto px-2.5 pb-1 hidden-scrollbar md:mx-0 md:flex-wrap md:px-0"
  >
    {DESTINATION_CHIP_OPTIONS.map((option) => {
      const isActive = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={isActive}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 shrink-0 rounded-full px-4 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isActive
              ? "bg-ink-900 text-white"
              : "bg-surface text-body ring-1 ring-line hover:bg-surface-muted hover:text-heading",
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const DestinationPage = () => {
  useTitle("tourtoise - let's find your next tour destination");
  const [type, setType] = useState("all");
  const typeLabel = DESTINATION_CHIP_OPTIONS.find((option) => option.value === type)?.label;

  const destinationQuery = useMemo(
    () => ({
      page: 1,
      page_size: PAGE_SIZE,
      destination_type: type === "all" ? undefined : type,
    }),
    [type],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDestinationInfiniteListInfiniteQuery(destinationQuery);

  const destinations = useMemo(
    () => data?.pages?.flatMap((page) => page?.data || []) || [],
    [data],
  );
  const isInitialLoading = isLoading || (isFetching && !data?.pages?.length);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Container>
      <JourneyHero />

      <section id="explore" aria-labelledby="explore-title" className="scroll-mt-24 space-y-6">
        <div className="space-y-4">
          <div>
            <Heading level={2} id="explore-title">
              Where&apos;s next?
            </Heading>
            <Text tone="subtle" className="mt-1">
              Hand-picked places with guides, food and the best time to go.
            </Text>
          </div>
          <TypeChips value={type} onChange={setType} />
        </div>

        {isInitialLoading && <LoadingDestinationList />}

        {!isInitialLoading && isError && <DestinationFetchError />}

        {!isInitialLoading && !isError && !destinations.length && (
          <EmptyPage
            icon={MapPinOff}
            eyebrow={type === "all" ? "More places coming soon" : "No matching places"}
            title={type === "all" ? "No destinations available" : `No ${typeLabel?.toLowerCase()} destinations yet`}
            description={
              type === "all"
                ? "New destinations will appear here as soon as they are ready to explore."
                : "Try another type, or browse everything."
            }
            actionLabel={type === "all" ? undefined : "Show all destinations"}
            onAction={type === "all" ? undefined : () => setType("all")}
          />
        )}

        {!isInitialLoading && !isError && destinations.length > 0 && (
          <>
            <ul role="list" className={DESTINATION_GRID_CLASS}>
              {destinations.map((destination) => (
                <li key={destination.slug}>
                  <DestinationCard destination={destination} />
                </li>
              ))}
            </ul>
            <InfiniteScroll
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              loadingLabel="Loading more destinations..."
            />
          </>
        )}
      </section>

      <CompanionStrip />
    </Container>
  );
};

export default DestinationPage;
