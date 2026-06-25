import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useDestinationDetailQuery,
  useSaveDestinationMutation,
} from "@/features/destination/destinationApiSlice";
import { demoDestinations } from "@/pages/destinations/demo-data";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Activity,
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Clock,
  Languages,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  Ticket,
  Utensils,
  WalletCards,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import TripPlanningDrawer from "@/pages/trips/create-trip/trip-planning-drawer";
import { formatLabel } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { ActivityCard, AttractionCard, CuisineCard } from "./item-cards";
import { DetailPill, PageTitle } from "@/components/shared/utils";
import { formatMonths } from "@/lib/date-time";
import DestinationGallery from "./destination-gallery";
import CardSlider from "@/components/shared/card-slider";
import { toast } from "sonner";
import Card from "@/components/ui/card";

const getFeatureType = (item) =>
  formatLabel(
    item?.attraction_type || item?.activity_type || item?.cuisine_type,
  );

const getStayLength = (destination) => {
  if (destination.min_stay_days && destination.max_stay_days) {
    return `${destination.min_stay_days}-${destination.max_stay_days} days`;
  }

  return destination.duration || "Flexible";
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function InfoSection({ title, children }) {
  return (
    <Card>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-2 text-slate-600">{children}</div>
    </Card>
  );
}

function TripBasicsCard({ destination, bestTime, languages, setPlanningOpen }) {
  return (
    <Card>
      <div className="flbx">
        <h2 className="text-lg font-bold text-slate-950">Trip Basics</h2>
        <Button
          onClick={() => setPlanningOpen(true)}
          className="rounded-full hidden md:block"
        >
          Start Planning
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 md:block md:space-y-4">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">
            Currency
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {destination.currency || destination.currency_code || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">
            Languages
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Languages size={16} className="text-primary" />
            {languages}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">
            Ideal stay
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {getStayLength(destination)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Budget</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatLabel(destination.budget_tier)}
          </p>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="text-xs font-medium uppercase text-slate-500">
            Best Times
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {bestTime}
          </p>
        </div>
      </div>
    </Card>
  );
}

function FeatureBadges({ item, value }) {
  return (
    <div className="flex flex-wrap gap-2">
      <DetailPill>{value}</DetailPill>
      {item.is_featured && (
        <DetailPill>
          <Star size={12} className="mr-1 inline-block fill-current" />
          Featured
        </DetailPill>
      )}
      {item.is_must_try && (
        <DetailPill>
          <Star size={12} className="mr-1 inline-block fill-current" />
          Must try
        </DetailPill>
      )}
    </div>
  );
}

function FeatureMetaList({ metaItems = [], compact = false }) {
  const visibleMetaItems = metaItems.filter((meta) => meta.value);

  if (!visibleMetaItems.length) return null;

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-2 text-sm"}>
      {visibleMetaItems.map((meta) => (
        <div
          key={meta.label}
          className={
            compact
              ? "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700"
              : "flex items-start gap-2 text-slate-700"
          }
        >
          {React.createElement(meta.icon, {
            size: compact ? 13 : 16,
            className: compact
              ? "shrink-0 text-primary"
              : "mt-0.5 shrink-0 text-primary",
          })}
          <span>
            {!compact && (
              <span className="font-semibold text-slate-900">
                {meta.label}:{" "}
              </span>
            )}
            {meta.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeatureDetailContent({ feature }) {
  if (!feature) return null;

  const { item, icon: Icon, metaItems, title } = feature;
  const fallbackIcon = React.createElement(Icon, { size: 38 });
  const type = getFeatureType(item);

  return (
    <div className="overflow-hidden bg-white">
      <div className="relative aspect-[16/10] max-h-[340px] bg-slate-100">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            {fallbackIcon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <FeatureBadges item={item} value={type} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs font-semibold uppercase text-white/70">
            {title}
          </p>
          <h3 className="mt-1 text-xl font-bold leading-tight">{item.name}</h3>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {item.description && (
          <p className="text-sm leading-6 text-slate-600">{item.description}</p>
        )}

        <FeatureMetaList metaItems={metaItems} />

        {(item.address || item.best_time_to_visit || item.tips) && (
          <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            {item.address && (
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{item.address}</span>
              </p>
            )}
            {item.best_time_to_visit && (
              <p className="flex items-start gap-2">
                <CalendarDays
                  size={16}
                  className="mt-0.5 shrink-0 text-primary"
                />
                <span>{item.best_time_to_visit}</span>
              </p>
            )}
            {item.tips && <p className="leading-6">{item.tips}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function ResponsiveFeatureDetail({ feature, open, onOpenChange }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const touchStartY = useRef(null);

  const handleTouchStart = (event) => {
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event) => {
    if (touchStartY.current === null) return;

    const distance = event.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;

    if (distance > 80) onOpenChange(false);
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[100dvh] gap-0 overflow-hidden rounded-none border-0 p-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300" />
          <SheetTitle className="sr-only">{feature?.item?.name}</SheetTitle>
          <SheetDescription className="sr-only">
            {feature?.item?.description || "Destination feature details"}
          </SheetDescription>
          <div className="custom-scrollbar mt-3 flex-1 overflow-y-auto">
            <FeatureDetailContent feature={feature} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">{feature?.item?.name}</DialogTitle>
        <DialogDescription className="sr-only">
          {feature?.item?.description || "Destination feature details"}
        </DialogDescription>
        <div className="custom-scrollbar overflow-y-auto">
          <FeatureDetailContent feature={feature} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AttractionSection({ attractions, onSelect }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">Top Attractions</h2>
        {!!attractions?.length && (
          <p className="text-sm text-slate-500">{attractions.length} listed</p>
        )}
      </div>

      {attractions?.length ? (
        <CardSlider
          items={attractions}
          renderItem={(item) => (
            <AttractionCard item={item} onSelect={onSelect} />
          )}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No attractions available yet.
        </div>
      )}
    </section>
  );
}

function DestinationFeatureSection({
  title,
  items,
  emptyText,
  getMetaItems,
  renderCard,
  onSelect,
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        {!!items?.length && (
          <p className="text-sm text-slate-500">{items.length} listed</p>
        )}
      </div>

      {items?.length ? (
        <CardSlider
          items={items}
          renderItem={(item) =>
            renderCard({
              item,
              key: item.slug || item.name,
              metaItems: getMetaItems(item),
              onSelect,
            })
          }
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {emptyText}
        </div>
      )}
    </section>
  );
}

const DestinationDetailPage = () => {
  const { destination_id } = useParams();
  const [planningOpen, setPlanningOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const planningHistoryEntryRef = useRef(false);
  const demoDestination = demoDestinations.find(
    (destination) => destination.id === destination_id,
  );
  const { data, isFetching } = useDestinationDetailQuery(
    demoDestination ? skipToken : destination_id,
  );
  const [saveDestination, { isLoading: isSavingDestination }] =
    useSaveDestinationMutation();
  const destination = demoDestination || data?.data || data;
  const isSaved = destination?.is_saved;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handlePopState = () => {
      if (!planningHistoryEntryRef.current) return;

      planningHistoryEntryRef.current = false;
      setPlanningOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !planningOpen) return;
    if (planningHistoryEntryRef.current) return;

    window.history.pushState(
      {
        ...(window.history.state || {}),
        tripPlanningDrawer: true,
      },
      "",
      window.location.href,
    );
    planningHistoryEntryRef.current = true;
  }, [planningOpen]);

  const handlePlanningOpenChange = (nextOpen) => {
    if (nextOpen) {
      setPlanningOpen(true);
      return;
    }

    if (
      typeof window !== "undefined" &&
      planningHistoryEntryRef.current &&
      window.history.state?.tripPlanningDrawer
    ) {
      planningHistoryEntryRef.current = false;
      window.history.back();
    }

    setPlanningOpen(false);
  };

  const handleSaveDestination = async () => {
    if (!destination?.slug) {
      toast.error("Destination slug is missing.");
      return;
    }

    const nextSavedState = !isSaved;

    try {
      await saveDestination({
        destination_slug: destination.slug,
        save: nextSavedState,
      }).unwrap();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          nextSavedState
            ? "Could not save this destination."
            : "Could not unsave this destination.",
        ),
      );
    }
  };

  if (isFetching) {
    return (
      <div className="center min-h-[420px] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading destination...
      </div>
    );
  }

  if (!destination) {
    return (
      <section className="space-y-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-primary"
        >
          <ArrowLeft size={16} />
          Destinations
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-950">
            Destination not found
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            The selected destination could not be loaded.
          </p>
        </div>
      </section>
    );
  }

  const bestTime = formatMonths(destination.best_travel_months);
  const languages = destination.local_languages?.join(", ") || "N/A";
  const attractions = destination.attractions || [];
  const activities = destination.activities || [];
  const cuisines = destination.cuisines || [];
  const getActivityMetaItems = (activity) => [
    {
      icon: Clock,
      label: "Duration",
      value: activity.duration_hours
        ? `${activity.duration_hours} hour${
            Number(activity.duration_hours) === 1 ? "" : "s"
          }`
        : null,
    },
    {
      icon: WalletCards,
      label: "Cost",
      value: activity.approx_cost
        ? `${activity.approx_cost}${
            activity.cost_unit ? ` ${activity.cost_unit}` : ""
          }`
        : formatLabel(activity.budget_tier),
    },
  ];
  const getCuisineMetaItems = (cuisine) => [
    {
      icon: Utensils,
      label: "Meal",
      value: formatLabel(cuisine.meal_type),
    },
    {
      icon: Activity,
      label: "Spice",
      value: formatLabel(cuisine.spice_level),
    },
    {
      icon: WalletCards,
      label: "Price",
      value: cuisine.approx_price_range,
    },
  ];
  const getAttractionMetaItems = (attraction) => [
    {
      icon: MapPin,
      label: "Type",
      value: formatLabel(attraction.attraction_type),
    },
    {
      icon: Clock,
      label: "Best time",
      value: attraction.best_time_of_day
        ? formatLabel(attraction.best_time_of_day)
        : attraction.opening_hours,
    },
    {
      icon: Ticket,
      label: "Entrance",
      value:
        attraction.entrance_fee_required === false
          ? "Free"
          : attraction.approx_entrance_fee ||
            attraction.entry_fee ||
            attraction.ticket_price,
    },
  ];
  const openFeatureDetail =
    ({ title, icon, getMetaItems }) =>
    (item) => {
      setActiveFeature({
        title,
        icon,
        item,
        metaItems: getMetaItems(item),
      });
    };
  const featureDetailOpen = Boolean(activeFeature);

  return (
    <>
      <section className="space-y-5 md:space-y-6 pt-5 pb-16 md:pb-5">
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5 md:space-y-6">
            <DestinationCover destination={destination} />
            <div className="space-y-4 xl:hidden">
              <TripBasicsCard
                destination={destination}
                bestTime={bestTime}
                languages={languages}
                setPlanningOpen={setPlanningOpen}
              />
              <Button
                className="h-12 w-full rounded-full"
                onClick={() => handlePlanningOpenChange(true)}
              >
                <Sparkles size={18} />
                Start Planning your Trip
              </Button>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Overview
              </p>
              <p className="mt-1 leading-6 text-slate-700">
                {destination.overview || "No overview available yet."}
              </p>
            </div>

            <div className="xl:hidden">
              <DestinationGallery destination={destination} />
            </div>

            <AttractionSection
              attractions={attractions}
              onSelect={openFeatureDetail({
                title: "Attraction",
                icon: MapPin,
                getMetaItems: getAttractionMetaItems,
              })}
            />

            <DestinationFeatureSection
              title="Activities"
              items={activities}
              emptyText="No activities available yet."
              getMetaItems={getActivityMetaItems}
              onSelect={openFeatureDetail({
                title: "Activity",
                icon: Activity,
                getMetaItems: getActivityMetaItems,
              })}
              renderCard={({ item, key, onSelect }) => (
                <ActivityCard key={key} item={item} onSelect={onSelect} />
              )}
            />

            <DestinationFeatureSection
              title="Local Cuisines"
              items={cuisines}
              emptyText="No cuisines available yet."
              getMetaItems={getCuisineMetaItems}
              onSelect={openFeatureDetail({
                title: "Cuisine",
                icon: Utensils,
                getMetaItems: getCuisineMetaItems,
              })}
              renderCard={({ item, key, metaItems, onSelect }) => (
                <CuisineCard
                  key={key}
                  item={item}
                  metaItems={metaItems}
                  onSelect={onSelect}
                />
              )}
            />
            <div className="grid gap-5 md:grid-cols-2 md:gap-6 border rounded-[28px] p-6">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Getting Around
                </p>
                <p className="mt-1 leading-6 text-slate-700">
                  {destination.getting_around ||
                    "No transport notes available."}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Visa notes
                </p>
                <p className="mt-1 leading-6 text-slate-700">
                  {destination.visa_notes || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div className="hidden xl:block">
              <TripBasicsCard
                destination={destination}
                bestTime={bestTime}
                languages={languages}
                setPlanningOpen={setPlanningOpen}
              />
            </div>
            <div className="hidden xl:block">
              <DestinationGallery destination={destination} />
            </div>
            <InfoSection title="Cultural Tips">
              {destination.cultural_tips?.length ? (
                <ul className="list-disc space-y-1 pl-5">
                  {destination.cultural_tips.map((tip) => (
                    <li key={tip} className="text-sm">
                      {tip}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No cultural tips available.</p>
              )}
            </InfoSection>
            <div className="space-y-3">
              <Button
                className="hidden h-12 w-full rounded-full xl:flex"
                onClick={() => handlePlanningOpenChange(true)}
              >
                <Sparkles size={18} />
                Start Planning your Trip
              </Button>
              <Button
                variant="outline"
                className="hidden h-12 w-full rounded-full xl:flex"
                disabled={isSavingDestination}
                onClick={handleSaveDestination}
              >
                <Bookmark
                  size={18}
                  className={isSaved ? "fill-primary text-primary" : ""}
                />
                {isSavingDestination
                  ? "Saving..."
                  : isSaved
                    ? "Add to Bucket List"
                    : "Added to Bucket List"}
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <TripPlanningDrawer
        destination={destination}
        open={planningOpen}
        onOpenChange={handlePlanningOpenChange}
      />
      <ResponsiveFeatureDetail
        feature={activeFeature}
        open={featureDetailOpen}
        onOpenChange={(open) => {
          if (!open) setActiveFeature(null);
        }}
      />
    </>
  );
};

const DestinationCover = ({ destination }) => {
  const tags =
    destination.tags
      ?.map((tag) => tag.name || tag.slug || tag)
      .filter(Boolean) ||
    destination.highlights ||
    [];
  return (
    <>
      <div className="relative -mx-4 overflow-hidden md:mx-0 md:rounded-[28px] -mt-5 md:mt-0">
        <Link
          to="/"
          className="hidden md:flex md:items-center md:justify-center absolute left-4 top-4 z-20 h-10 w-10 rounded-full bg-white/50 text-sm font-medium backdrop-blur-sm transition hover:bg-white/70"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="aspect-[16/9]">
          <img
            src={destination.cover_image}
            alt={destination.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
        <div className="hidden md:block absolute bottom-0 left-0 right-0 p-4 text-white md:p-8">
          <PageTitle
            title={destination.name}
            text={destination.tagline}
            variant="light"
          />
        </div>
      </div>
      <div className="block md:hidden mt-3">
        <PageTitle title={destination.name} text={destination.tagline} />
      </div>
      {!!tags.length && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default DestinationDetailPage;
