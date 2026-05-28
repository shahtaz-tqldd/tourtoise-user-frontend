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
import { useDestinationDetailQuery } from "@/features/destination/destinationApiSlice";
import { demoDestinations } from "@/pages/destinations/demo-data";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock,
  Languages,
  Loader2,
  MapPin,
  Navigation,
  Plane,
  Sparkles,
  Star,
  Ticket,
  Utensils,
  WalletCards,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import TripPlanningDrawer from "@/pages/trips/create-trip/trip-planning-drawer";

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatLabel = (value) => value?.replaceAll("_", " ") || "N/A";

const getFeatureType = (item) =>
  formatLabel(item?.attraction_type || item?.activity_type || item?.cuisine_type);

const formatMonths = (months) =>
  months?.length
    ? months
        .map((month) => monthLabels[Number(month) - 1])
        .filter(Boolean)
        .join(", ")
    : "N/A";

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

function FactItem({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      {React.createElement(icon, { size: 18, className: "text-primary" })}
      <p className="mt-3 text-xs font-medium uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <section className="rounded-[28px] bg-white p-5">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-2 text-slate-600">{children}</div>
    </section>
  );
}

function DetailPill({ children }) {
  if (!children) return null;

  return (
    <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-800 shadow-sm">
      {children}
    </span>
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

function AttractionCard({ item, onSelect }) {
  const fallbackIcon = <MapPin size={34} />;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            {fallbackIcon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        <div className="absolute left-3 top-3">
          <FeatureBadges item={item} value={formatLabel(item.attraction_type)} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold leading-tight">{item.name}</h3>
          {item.address && (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-white/80">
              <MapPin size={13} className="mt-0.5 shrink-0" />
              <span className="line-clamp-2">{item.address}</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {item.description || "View attraction details."}
        </p>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
          <ChevronRight size={18} />
        </span>
      </div>
    </button>
  );
}

function ActivityCard({ item, metaItems, onSelect }) {
  const visibleMetaItems = metaItems.filter((meta) => meta.value);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex min-h-[250px] flex-col rounded-[24px] border border-primary/10 bg-white p-4 text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:ring-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Activity size={24} />
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-primary group-hover:text-white">
          <ChevronRight size={18} />
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase text-primary">
          {formatLabel(item.activity_type)}
        </p>
        <h3 className="mt-1 text-xl font-bold leading-tight text-slate-950">
          {item.name}
        </h3>
      </div>

      {item.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {item.description}
        </p>
      )}

      <div className="mt-auto pt-5">
        {!!visibleMetaItems.length && (
          <div className="grid grid-cols-2 gap-2">
            {visibleMetaItems.slice(0, 4).map((meta) => (
              <div
                key={meta.label}
                className="rounded-2xl bg-slate-50 px-3 py-2"
              >
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  {React.createElement(meta.icon, {
                    size: 13,
                    className: "shrink-0 text-primary",
                  })}
                  {meta.label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold capitalize text-slate-900">
                  {meta.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function CuisineCard({ item, metaItems, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="grid grid-cols-[200px_minmax(0,1fr)]">
        <div className="relative min-h-[190px] bg-slate-100">
          {item.cover_image ? (
            <img
              src={item.cover_image}
              alt={item.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
              <Utensils size={30} />
            </div>
          )}
          {item.is_must_try && (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-slate-800 shadow-sm">
              Must try
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col p-4">
          <p className="text-xs font-semibold uppercase text-primary">
            {formatLabel(item.cuisine_type)}
          </p>
          <h3 className="mt-1 text-lg font-bold leading-tight text-slate-950">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          )}
          <div className="mt-auto pt-4">
            <FeatureMetaList metaItems={metaItems.slice(0, 3)} compact />
          </div>
        </div>
      </div>
    </button>
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
          <p className="text-sm leading-6 text-slate-600">
            {item.description}
          </p>
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
        <h2 className="text-xl font-bold text-slate-950">Attractions</h2>
        {!!attractions?.length && (
          <p className="text-sm text-slate-500">{attractions.length} listed</p>
        )}
      </div>

      {attractions?.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {attractions.map((item) => (
            <AttractionCard
              key={item.slug || item.name}
              item={item}
              onSelect={onSelect}
            />
          ))}
        </div>
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
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) =>
            renderCard({
              item,
              key: item.slug || item.name,
              metaItems: getMetaItems(item),
              onSelect,
            }),
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function DestinationGallery({ destination }) {
  const images = useMemo(() => {
    const galleryImages =
      destination.images?.map((image) => ({
        url: image.image_url,
        caption: image.caption,
        sortOrder: image.sort_order,
      })) || [];

    return [
      destination.cover_image && {
        url: destination.cover_image,
        caption: `${destination.name} cover`,
        sortOrder: 0,
      },
      ...galleryImages,
    ]
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [destination]);

  if (!images.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">Gallery</h2>
        <p className="text-sm text-slate-500">{images.length} images</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
        {images.slice(0, 5).map((image, index) => (
          <figure
            key={`${image.url}-${index}`}
            className={`relative overflow-hidden rounded-2xl bg-slate-100 ${
              index === 0
                ? "aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto"
                : "aspect-[4/3]"
            }`}
          >
            <img
              src={image.url}
              alt={image.caption || `${destination.name} gallery ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {image.caption && (
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/75 to-transparent p-3 text-xs font-medium text-white">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

const DestinationDetailPage = () => {
  const { destination_id } = useParams();
  const [planningOpen, setPlanningOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const demoDestination = demoDestinations.find(
    (destination) => destination.id === destination_id,
  );
  const { data, isFetching } = useDestinationDetailQuery(
    demoDestination ? skipToken : destination_id,
  );
  const destination = demoDestination || data?.data || data;

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
  const tags =
    destination.tags
      ?.map((tag) => tag.name || tag.slug || tag)
      .filter(Boolean) ||
    destination.highlights ||
    [];
  const attractions = destination.attractions || [];
  const activities = destination.activities || [];
  const cuisines = destination.cuisines || [];
  const getActivityMetaItems = (activity) => [
    {
      icon: Navigation,
      label: "Difficulty",
      value: formatLabel(activity.difficulty_level),
    },
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
  const openFeatureDetail = ({ title, icon, getMetaItems }) => (item) => {
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
      <section className="space-y-6 py-5">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[28px]">
              <Link
                to="/"
                className="text-sm font-medium absolute top-4 left-4 h-10 w-10 bg-white/40 backdrop-blur-sm rounded-full center cursor-pointer z-20 hover:bg-white/60 tr"
              >
                <ArrowLeft size={16} />
              </Link>
              <div className="aspect-[16/9] min-h-[420px] md:aspect-[21/9]">
                <img
                  src={destination.cover_image}
                  alt={destination.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                      {destination.name}
                    </h1>
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/85 md:text-base">
                      <MapPin size={18} />
                      {destination.region}, {destination.country}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                      {destination.tagline || destination.overview}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FactItem
                icon={CalendarDays}
                label="Ideal stay"
                value={getStayLength(destination)}
              />
              <FactItem icon={Plane} label="Best time" value={bestTime} />
              <FactItem
                icon={WalletCards}
                label="Budget"
                value={formatLabel(destination.budget_tier)}
              />
              <FactItem
                icon={Navigation}
                label="Difficulty"
                value={destination.difficulty}
              />
            </div>

            <InfoSection title="Overview">
              {destination.overview || "No overview available yet."}
            </InfoSection>

            <InfoSection title="Getting Around">
              {destination.getting_around || "No transport notes available."}
            </InfoSection>

            <DestinationGallery destination={destination} />
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
              renderCard={({ item, key, metaItems, onSelect }) => (
                <ActivityCard
                  key={key}
                  item={item}
                  metaItems={metaItems}
                  onSelect={onSelect}
                />
              )}
            />

            <DestinationFeatureSection
              title="Cuisines"
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

            <InfoSection title="Cultural Tips">
              {destination.cultural_tips?.length ? (
                <ul className="list-disc space-y-2 pl-5">
                  {destination.cultural_tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p>No cultural tips available.</p>
              )}
            </InfoSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[28px] bg-white p-6">
              <h2 className="text-lg font-bold text-slate-950">Trip Basics</h2>
              <div className="mt-4 space-y-4">
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
                    Coordinates
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {destination.latitude && destination.longitude
                      ? `${destination.latitude}, ${destination.longitude}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Visa notes
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {destination.visa_notes || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {!!tags.length && (
              <div className="rounded-[28px] bg-white p-6">
                <h2 className="text-lg font-bold text-slate-950">Tags</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="h-12 w-full rounded-full"
              onClick={() => setPlanningOpen(true)}
            >
              <Sparkles size={18} />
              Start Planning with AI
            </Button>
          </aside>
        </div>
      </section>

      <TripPlanningDrawer
        destination={destination}
        open={planningOpen}
        onOpenChange={setPlanningOpen}
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

export default DestinationDetailPage;
