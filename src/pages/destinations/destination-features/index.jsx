import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  Clock3,
  MapPin,
  Ticket,
  Utensils,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import SearchBar from "@/components/shared/search-bar";
import useDebounce from "@/hooks/useDebounce";
import FeatureDetails from "@/pages/destinations/destination-details/components/feature-details";
import {
  useDestinationFeatureInfiniteListInfiniteQuery,
  useDestinationShortDetailQuery,
} from "@/features/destination/destinationApiSlice";
import { formatLabel } from "@/lib/utils";
import { EmptyState, Image } from "@/components/shared/utils";

const PAGE_SIZE = 12;

const featureConfigs = {
  attractions: {
    title: "Attractions",
    singular: "attraction",
    description: "Explore the places worth making time for.",
    icon: MapPin,
    getType: (item) => item.attraction_type,
    getMeta: (item) => [
      item.best_time_of_day || item.opening_hours,
      item.entrance_fee_required === false
        ? "Free entry"
        : item.approx_entrance_fee || item.entry_fee || item.ticket_price,
    ],
    fallbackIcon: MapPin,
  },
  activities: {
    title: "Activities",
    singular: "activity",
    description: "Find experiences to add to your itinerary.",
    icon: Clock3,
    getType: (item) => item.activity_type,
    getMeta: (item) => [
      item.duration_hours
        ? `${item.duration_hours} hour${Number(item.duration_hours) === 1 ? "" : "s"}`
        : null,
      item.approx_cost || formatLabel(item.budget_tier),
    ],
    fallbackIcon: Clock3,
  },
  cuisines: {
    title: "Local Cuisine",
    singular: "cuisine",
    description: "Discover the dishes you should try while you are there.",
    icon: Utensils,
    getType: (item) => item.cuisine_type,
    getMeta: (item) => [formatLabel(item.meal_type), item.approx_price_range],
    fallbackIcon: Utensils,
  },
};

const getFeatureItems = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
};

const getFeatureTotal = (response, fallback) =>
  response?.meta?.count ??
  response?.data?.meta?.count ??
  response?.count ??
  fallback;

const getDestinationName = (response) =>
  response?.data?.name || response?.name || "Destination";

const FeatureCard = ({ item, config, onSelect }) => {
  const coverImage = item.cover_image || item.images?.[0]?.image_url;
  const metaItems = config
    .getMeta(item)
    .filter((value) => value && value !== "N/A");

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group h-full w-full overflow-hidden rounded-3xl bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={coverImage}
          alt={item.name}
          width={600}
          className="transition duration-500 group-hover:scale-105"
        />
        {item.is_featured || item.is_must_try ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
            {item.is_must_try ? "Must try" : "Featured"}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <p className="truncate text-xs font-semibold uppercase text-primary">
          {formatLabel(config.getType(item))}
        </p>
        <h2 className="line-clamp-2 min-h-10 text-base font-semibold leading-5 text-slate-900">
          {item.name}
        </h2>
        {metaItems.length ? (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
            {metaItems.slice(0, 2).map((meta) => (
              <span
                key={meta}
                className="inline-flex min-w-0 items-center gap-1.5"
              >
                <Ticket size={13} className="shrink-0 text-primary" />
                <span className="truncate capitalize">{meta}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
};

const DestinationFeatureListPage = () => {
  const { destination_id: destinationSlug, feature_type: featureType } =
    useParams();
  const config = featureConfigs[featureType];
  const [search, setSearch] = useState("");
  const [activeFeature, setActiveFeature] = useState(null);
  const debouncedSearch = useDebounce(search.trim(), 350);

  const query = useMemo(
    () => ({
      destination_slug: destinationSlug,
      feature_type: featureType,
      page_size: PAGE_SIZE,
      search: debouncedSearch || undefined,
    }),
    [debouncedSearch, destinationSlug, featureType],
  );

  const { data: destinationData } = useDestinationShortDetailQuery(
    destinationSlug,
    {
      skip: !destinationSlug,
    },
  );
  const {
    data,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDestinationFeatureInfiniteListInfiniteQuery(query, {
    skip: !config || !destinationSlug,
  });
  const items = useMemo(
    () => data?.pages?.flatMap((page) => getFeatureItems(page)) || [],
    [data],
  );
  const total = getFeatureTotal(data?.pages?.[0], items.length);
  const destinationName = getDestinationName(destinationData);
  const isSearchSettling = search.trim() !== debouncedSearch;
  const isInitialLoading = isLoading || (isFetching && !data?.pages?.length);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleSelectFeature = useCallback(
    (item) => {
      setActiveFeature({
        title: formatLabel(config.singular),
        icon: config.icon,
        item,
      });
    },
    [config],
  );

  if (!config) {
    return (
      <section className="py-8 md:py-12">
        <Link
          to={`/destinations/${destinationSlug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={16} /> Back to destination
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Category not found
        </h1>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-7 py-5 pb-20 md:pb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flx gap-2">
            <Link
              to={`/destinations/${destinationSlug}`}
              className="h-10 w-10 center bg-slate-100 rounded-full hover:bg-primary/10 tr"
            >
              <ChevronLeft size={14} />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
              {config.title} in {destinationName}
            </h1>
          </div>

          <SearchBar
            searchQuery={search}
            setSearchQuery={setSearch}
            placeholder={`Search ${config.title.toLowerCase()}`}
            className="w-full md:max-w-sm"
          />
        </div>

        {!isInitialLoading && !isSearchSettling && !isError && (
          <p className="text-sm font-medium text-slate-500">
            {total} {total === 1 ? config.singular : config.title.toLowerCase()}{" "}
            found
          </p>
        )}

        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="font-semibold text-red-900">
              Could not load {config.title.toLowerCase()}
            </h2>
            <p className="mt-1 text-sm text-red-700">
              Please try again shortly.
            </p>
          </div>
        ) : isInitialLoading || isSearchSettling ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <FeatureCard
                  key={item.id || item.slug || item.name}
                  item={item}
                  config={config}
                  onSelect={handleSelectFeature}
                />
              ))}
            </div>
            <InfiniteScroll
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              loadingLabel={`Loading more ${config.title.toLowerCase()}...`}
            />
          </>
        ) : (
          <EmptyState
            title={`No ${config.title.toLowerCase()} found`}
            description={
              search
                ? `No ${config.title.toLowerCase()} match your search for "${search}". Try another search term.`
                : `Sorry currently there are no ${config.title.toLowerCase()} available for this destination.`
            }
            onClear={search ? () => setSearch("") : null}
          />
        )}
      </section>
      <FeatureDetails
        feature={activeFeature}
        open={Boolean(activeFeature)}
        onOpenChange={(open) => {
          if (!open) setActiveFeature(null);
        }}
      />
    </>
  );
};

export default DestinationFeatureListPage;
