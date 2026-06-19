import { Button } from "@/components/ui/button";
import React, { useMemo, useState } from "react";
import DestinationCard from "./components/destination-card";
import DestinationFilter from "./filters";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useDestinationListQuery,
  useSaveDestinationListQuery,
} from "@/features/destination/destinationApiSlice";
import { PageTitle } from "@/components/shared/utils";
import { Bookmark, CalendarDays, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getCloudinaryPreviewUrl } from "@/lib/utils";

const getDestinationRows = (response) => {
  const payload = response?.data || response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getDestinationCount = (response, rows) => {
  const payload = response?.data || response;

  return (
    response?.meta?.count ||
    response?.meta?.total ||
    payload?.count ||
    payload?.total ||
    rows.length
  );
};

const getDestinationFromSavedRow = (row) =>
  row?.destination || row?.destination_detail || row?.destination_data || row;

const DestinationMiniList = ({ destinations, emptyText }) => {
  if (!destinations.length) {
    return <p className="text-sm leading-5 text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {destinations.map((destination) => (
        <Link
          key={destination.slug || destination.id || destination.name}
          to={`/destinations/${destination.slug}`}
          className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {destination.cover_image ? (
              <img
                src={getCloudinaryPreviewUrl(destination.cover_image)}
                alt={destination.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-slate-950">
              {destination.name}
            </h3>
            <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-slate-500">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">
                {[destination.region, destination.country]
                  .filter(Boolean)
                  .join(", ") || "Destination"}
              </span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const BucketListPanel = ({
  peakDestinations,
  savedDestinations,
  isFetching,
  className = "",
}) => (
  <aside className={`min-w-0 lg:sticky lg:top-24 lg:self-start ${className}`}>
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <CalendarDays size={14} />
          Peak season for visit
        </div>
        <DestinationMiniList
          destinations={peakDestinations}
          emptyText="Seasonal destination suggestions will appear here."
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <Bookmark size={14} />
          Your bucket list
        </div>
        {isFetching ? (
          <p className="text-sm leading-5 text-slate-500">
            Loading saved destinations...
          </p>
        ) : (
          <DestinationMiniList
            destinations={savedDestinations}
            emptyText="Saved destinations will appear here."
          />
        )}
      </section>
    </div>
  </aside>
);

const BucketListDrawer = ({
  peakDestinations,
  savedDestinations,
  isFetching,
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-12 rounded-full border-slate-200 lg:hidden"
        aria-label="Open bucket list"
      >
        <Bookmark size={16} />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="w-[min(92vw,380px)] overflow-y-auto p-0"
      showCloseButton={false}
    >
      <SheetHeader className="border-b border-slate-100 p-4 pr-10 text-left">
        <SheetTitle>Bucket List</SheetTitle>
        <SheetDescription>Saved places and seasonal ideas.</SheetDescription>
      </SheetHeader>
      <SheetClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-3 top-3 rounded-full"
          aria-label="Close bucket list"
        >
          <X size={16} />
        </Button>
      </SheetClose>
      <div className="p-4">
        <BucketListPanel
          peakDestinations={peakDestinations}
          savedDestinations={savedDestinations}
          isFetching={isFetching}
        />
      </div>
    </SheetContent>
  </Sheet>
);

const DestiantionPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState([]);
  const [destinationTypes, setDestinationTypes] = useState([]);
  const [budgetTiers, setBudgetTiers] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  const destinationQuery = useMemo(
    () => ({
      page: 1,
      page_size: 12,
      search: searchQuery || undefined,
      destination_type: destinationTypes,
      country_code: countries,
      budget_tier: budgetTiers,
      difficulty: difficulties,
    }),
    [budgetTiers, countries, destinationTypes, difficulties, searchQuery],
  );

  const { data, isFetching, isError } =
    useDestinationListQuery(destinationQuery);
  const { data: savedData, isFetching: isSavedFetching } =
    useSaveDestinationListQuery({
      page: 1,
      pageSize: 6,
    });
  const destinations = useMemo(() => getDestinationRows(data), [data]);
  const totalDestinations = getDestinationCount(data, destinations);
  const savedDestinations = useMemo(
    () =>
      getDestinationRows(savedData)
        .map(getDestinationFromSavedRow)
        .filter((destination) => destination?.slug)
        .slice(0, 4),
    [savedData],
  );
  const peakDestinations = useMemo(() => {
    const bestTimeDestinations = destinations.filter(
      (destination) => destination?.is_now_best_time,
    );

    return (bestTimeDestinations.length ? bestTimeDestinations : destinations)
      .filter((destination) => destination?.slug)
      .slice(0, 3);
  }, [destinations]);

  const clearFilters = () => {
    setSearchQuery("");
    setCountries([]);
    setDestinationTypes([]);
    setBudgetTiers([]);
    setDifficulties([]);
  };

  return (
    <section className="grid gap-10 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">
        <PageTitle
          title="Where's Next?"
          text="Let's find your next travel destination and make a fantastic tour
              plan with our smart tour assistant"
        />

        <DestinationFilter
          totalDestinations={totalDestinations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          countries={countries}
          setCountries={setCountries}
          destinationTypes={destinationTypes}
          setDestinationTypes={setDestinationTypes}
          budgetTiers={budgetTiers}
          setBudgetTiers={setBudgetTiers}
          difficulties={difficulties}
          setDifficulties={setDifficulties}
          clearFilters={clearFilters}
          actions={
            <BucketListDrawer
              peakDestinations={peakDestinations}
              savedDestinations={savedDestinations}
              isFetching={isSavedFetching}
            />
          }
        />

        <div className="grid gap-4 xl:grid-cols-2">
          {destinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>

        {isFetching && (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              Loading destinations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fetching published destinations from the API.
            </p>
          </div>
        )}

        {isError && !isFetching && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-red-900">
              Could not load destinations
            </h2>
            <p className="mt-1 text-sm text-red-700">
              Check the API base URL, endpoint path, and whether published
              destinations exist.
            </p>
          </div>
        )}

        {!isFetching && !isError && !destinations.length && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              No destinations found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Adjust the search, country, or destination type filters.
            </p>
            <Button className="mt-4" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <BucketListPanel
        peakDestinations={peakDestinations}
        savedDestinations={savedDestinations}
        isFetching={isSavedFetching}
        className="hidden lg:block"
      />
    </section>
  );
};

export default DestiantionPage;
