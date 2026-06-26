import { useMemo, useState } from "react";
import { ArrowLeft, Clock3, MapPin, Search, Ticket, Utensils, WalletCards } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/table/pagination";
import useDebounce from "@/hooks/useDebounce";
import { useDestinationFeatureListQuery } from "@/features/destination/destinationApiSlice";
import { formatLabel, getCloudinaryPreviewUrl } from "@/lib/utils";

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
    getMeta: (item) => [
      formatLabel(item.meal_type),
      item.approx_price_range,
    ],
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
  response?.meta?.count ?? response?.data?.meta?.count ?? response?.count ?? fallback;

const FeatureCard = ({ item, config }) => {
  const coverImage = item.cover_image || item.images?.[0]?.image_url;
  const FallbackIcon = config.fallbackIcon;
  const metaItems = config.getMeta(item).filter(
    (value) => value && value !== "N/A",
  );

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={getCloudinaryPreviewUrl(coverImage, 560)}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <FallbackIcon size={30} />
          </div>
        )}
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
              <span key={meta} className="inline-flex min-w-0 items-center gap-1.5">
                <Ticket size={13} className="shrink-0 text-primary" />
                <span className="truncate">{meta}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
};

const DestinationFeatureListPage = () => {
  const { destination_id: destinationSlug, feature_type: featureType } = useParams();
  const config = featureConfigs[featureType];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);

  const query = useMemo(
    () => ({
      destination_slug: destinationSlug,
      feature_type: featureType,
      page,
      page_size: PAGE_SIZE,
      search: debouncedSearch || undefined,
    }),
    [debouncedSearch, destinationSlug, featureType, page],
  );

  const { data, isFetching, isError } = useDestinationFeatureListQuery(query, {
    skip: !config || !destinationSlug,
  });
  const items = getFeatureItems(data);
  const total = getFeatureTotal(data, items.length);
  const Icon = config?.icon || MapPin;

  if (!config) {
    return (
      <section className="py-8 md:py-12">
        <Link to={`/destinations/${destinationSlug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft size={16} /> Back to destination
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Category not found</h1>
      </section>
    );
  }

  return (
    <section className="space-y-7 py-5 pb-20 md:py-8 md:pb-8">
      <Link
        to={`/destinations/${destinationSlug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to destination
      </Link>

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{config.title}</h1>
            <p className="mt-1.5 text-sm text-slate-600">{config.description}</p>
          </div>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${config.title.toLowerCase()}`}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
        </div>
      </div>

      {!isFetching && !isError && (
        <p className="text-sm font-medium text-slate-500">
          {total} {total === 1 ? config.singular : config.title.toLowerCase()} found
        </p>
      )}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="font-semibold text-red-900">Could not load {config.title.toLowerCase()}</h2>
          <p className="mt-1 text-sm text-red-700">Please try again shortly.</p>
        </div>
      ) : isFetching ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="aspect-[4/3] animate-pulse bg-slate-200" />
              <div className="space-y-3 p-4"><div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" /><div className="h-5 animate-pulse rounded bg-slate-200" /></div>
            </div>
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => <FeatureCard key={item.id || item.slug || item.name} item={item} config={config} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-900">No {config.title.toLowerCase()} found</h2>
          <p className="mt-1 text-sm text-slate-500">Try another search term.</p>
          {search ? <Button type="button" variant="outline" className="mt-4" onClick={() => setSearch("")}>Clear search</Button> : null}
        </div>
      )}

      {!isFetching && !isError ? (
        <div className="flex justify-center pt-2">
          <Pagination page={page} setPage={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      ) : null}
    </section>
  );
};

export default DestinationFeatureListPage;
