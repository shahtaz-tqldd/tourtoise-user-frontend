import { AuthorMessage, NotificationCard } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import TabMenu from "@/components/ui/tab";
import { useTripAgentRecommendationsQuery } from "@/features/trips/tripApiSlice";
import { getCloudinaryPreviewUrl } from "@/lib/utils";
import { skipToken } from "@reduxjs/toolkit/query";
import { Clock3, MapPin, Sparkles, Star, Utensils, Wallet } from "lucide-react";
import React, { useMemo, useState } from "react";

const categories = [
  {
    key: "attractions",
    messageKey: "attractions",
    label: "Spots",
    title: "Recommended spots",
    empty: "No spots recommended yet.",
  },
  {
    key: "activities",
    messageKey: "activities",
    label: "Activities",
    title: "Recommended activities",
    empty: "No activities recommended yet.",
  },
  {
    key: "cuisines",
    messageKey: "cuisines",
    label: "Foods",
    title: "Recommended foods",
    empty: "No foods recommended yet.",
  },
];

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const unwrapRecommendations = (response) => response?.data || response || {};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatMoney = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue === 0) return "";

  return `$${numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

const getItemImage = (item) =>
  item?.cover_image || item?.images?.[0]?.image_url || "";

const getItemType = (item, categoryKey) => {
  if (categoryKey === "attractions") return item.attraction_type;
  if (categoryKey === "activities") return item.activity_type;
  return item.cuisine_type || item.meal_type;
};

const getItemMeta = (item, categoryKey) => {
  if (categoryKey === "attractions") {
    return [
      item.avg_duration_hours ? `${item.avg_duration_hours}h` : "",
      item.best_time_of_day ? formatLabel(item.best_time_of_day) : "",
      item.entrance_fee_required
        ? `Entry ${formatMoney(item.approx_entrance_fee) || "required"}`
        : "Free entry",
    ].filter(Boolean);
  }

  if (categoryKey === "activities") {
    return [
      item.duration_hours ? `${item.duration_hours}h` : "",
      item.difficulty_level ? formatLabel(item.difficulty_level) : "",
      item.booking_required ? "Booking needed" : "No booking",
    ].filter(Boolean);
  }

  return [
    item.meal_type ? formatLabel(item.meal_type) : "",
    item.spice_level ? `${formatLabel(item.spice_level)} spice` : "",
    item.is_vegetarian_friendly ? "Vegetarian friendly" : "",
  ].filter(Boolean);
};

const SkeletonCard = ({ index }) => (
  <div
    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className="h-32 animate-pulse bg-slate-100" />
    <div className="space-y-3 p-3">
      <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
      <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  </div>
);

const RecommendationSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
      <div className="mb-3 h-4 w-3/4 animate-pulse rounded-full bg-primary/10" />
      <div className="h-3 w-full animate-pulse rounded-full bg-primary/10" />
    </div>
    <div className="grid gap-3">
      {[0, 1, 2].map((index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  </div>
);

const InfoPill = ({ children }) => (
  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
    {children}
  </span>
);

const RecommendationCard = ({ item, categoryKey, index }) => {
  const image = getItemImage(item);
  const type = getItemType(item, categoryKey);
  const meta = getItemMeta(item, categoryKey);
  const price =
    categoryKey === "activities"
      ? formatMoney(item.approx_cost)
      : categoryKey === "cuisines"
        ? formatLabel(item.approx_price_range)
        : formatLabel(item.budget_tier);

  return (
    <article
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative h-36 bg-slate-100">
        {image ? (
          <img
            src={getCloudinaryPreviewUrl(image, 360)}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="center h-full text-slate-400">
            <Sparkles size={22} />
          </div>
        )}
        {item.is_featured || item.is_must_try ? (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">
            <Star size={13} />
            {item.is_must_try ? "Must try" : "Featured"}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-3">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold leading-5 text-slate-950">
              {item.name}
            </h4>
            {type && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                {formatLabel(type)}
              </span>
            )}
          </div>
          {/* <p className="mt-1 text-sm leading-6 text-slate-600">
            {item.description}
          </p> */}
        </div>

        {item.address && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={14} />
            <span className="truncate">{item.address}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {meta.map((value) => (
            <InfoPill key={value}>{value}</InfoPill>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Wallet size={14} />
            {price || "Flexible budget"}
          </span>
          {(item.best_season || item.best_time_of_day) && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} />
              {formatLabel(item.best_season || item.best_time_of_day)}
            </span>
          )}
          {categoryKey === "cuisines" && item.meal_type && (
            <span className="flex items-center gap-1.5">
              <Utensils size={14} />
              {formatLabel(item.meal_type)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

const RecommendationTabContent = ({ category, items, message }) => (
  <div className="space-y-3">
    {message && <NotificationCard message={message} />}

    <h3 className="text-sm font-semibold text-slate-950">{category.title}</h3>

    {items.length ? (
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <RecommendationCard
            key={item.id || item.slug || item.name}
            item={item}
            categoryKey={category.key}
            index={index}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        {category.empty}
      </div>
    )}
  </div>
);

const RecommendationsStep = ({ trip, onStepComplete, onStepSelect }) => {
  const tripId = getTripId(trip);
  const [activeCategory, setActiveCategory] = useState("attractions");
  const { data, isLoading, isFetching, isError } =
    useTripAgentRecommendationsQuery(tripId ? { trip_id: tripId } : skipToken);
  const recommendations = useMemo(() => unwrapRecommendations(data), [data]);
  const currentStep = Number(trip?.current_step);
  const isItineraryComplete = Number.isFinite(currentStep) && currentStep > 4;
  const itineraryButtonLabel = isItineraryComplete
    ? "Show itinerary"
    : "Start itinerary planning";
  const tabs = categories.map((category) => ({
    ...category,
    value: category.key,
    count: recommendations?.[category.key]?.length || 0,
  }));
  const activeCategoryConfig = categories.find(
    (category) => category.key === activeCategory,
  );
  const activeItems = recommendations?.[activeCategory] || [];
  const activeMessage =
    recommendations?.messages?.[activeCategoryConfig.messageKey];

  if (isLoading || isFetching) {
    return <RecommendationSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Could not load recommendations. Try reopening this step in a moment.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <AuthorMessage message="I have recommended you tour spots, activities and local cuisines based on your interests. Feel free to remove items and tell me what I can do more!" />

        <div className="sticky -top-4 z-10 bg-white pt-1">
          <TabMenu
            tabs={tabs}
            activeTab={activeCategory}
            setActiveTab={setActiveCategory}
          />
        </div>

        <RecommendationTabContent
          category={activeCategoryConfig}
          items={activeItems}
          message={activeMessage}
        />

        {recommendations?.is_discovery_complete && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
            Discovery is complete. You can review these suggestions or continue
            to itinerary planning.
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onStepSelect?.(1)}
        >
          View Preferences
        </Button>
        <Button type="button" onClick={() => onStepComplete?.()}>
          <Sparkles size={17} />
          {itineraryButtonLabel}
        </Button>
      </div>
    </div>
  );
};

export default RecommendationsStep;
