import { Button } from "@/components/ui/button";
import { useDestinationDetailQuery } from "@/features/destination/destinationApiSlice";
import { demoDestinations } from "@/pages/destinations/demo-data";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Clock,
  Languages,
  Loader2,
  MapPin,
  MessageSquareDot,
  Navigation,
  Plane,
  Star,
  Ticket,
  Utensils,
  WalletCards,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PlanningDrawer from "./planning-drawer";

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

function FactItem({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-white p-4 shadow-xs">
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
    <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-xs">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-slate-600">{children}</div>
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

function DestinationFeatureCard({ item, icon: Icon, metaItems = [] }) {
  const visibleMetaItems = metaItems.filter((meta) => meta.value);
  const fallbackIcon = React.createElement(Icon, { size: 34 });

  return (
    <article className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-xs">
      <div className="relative aspect-[4/3] bg-slate-100">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs font-semibold uppercase text-white/70">
            {formatLabel(
              item.attraction_type || item.activity_type || item.cuisine_type,
            )}
          </p>
          <h3 className="mt-1 text-xl font-bold leading-tight">{item.name}</h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {item.description && (
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {item.description}
          </p>
        )}

        {!!visibleMetaItems.length && (
          <div className="grid gap-2 text-sm text-slate-700">
            {visibleMetaItems.map((meta) => (
              <div key={meta.label} className="flex items-start gap-2">
                {React.createElement(meta.icon, {
                  size: 16,
                  className: "mt-0.5 shrink-0 text-primary",
                })}
                <span>
                  <span className="font-semibold text-slate-900">
                    {meta.label}:
                  </span>{" "}
                  {meta.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function DestinationFeatureSection({
  title,
  items,
  emptyText,
  icon,
  getMetaItems,
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
        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <DestinationFeatureCard
              key={item.slug || item.name}
              item={item}
              icon={icon}
              metaItems={getMetaItems(item)}
            />
          ))}
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

  return (
    <>
      <section className="space-y-6 py-5">
        <div className="relative overflow-hidden rounded-[28px] bg-slate-950">
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
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-slate-950">
                    {formatLabel(destination.destination_type)}
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    {formatLabel(destination.budget_tier)}
                  </span>
                </div>
                <h1 className="text-4xl font-bold leading-tight md:text-6xl">
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-primary/10 bg-white p-5 shadow-xs">
              <h2 className="text-lg font-bold text-slate-950 mb-2">
                Overview
              </h2>
              <p>{destination.overview || "No overview available yet."}</p>
              <h2 className="text-lg font-bold text-slate-950 mt-6 mb-2">
                Getting Around
              </h2>
              <p>
                {destination.getting_around || "No transport notes available."}
              </p>
            </section>

            <DestinationGallery destination={destination} />

            <DestinationFeatureSection
              title="Attractions"
              items={attractions}
              emptyText="No attractions available yet."
              icon={MapPin}
              getMetaItems={(attraction) => [
                {
                  icon: MapPin,
                  label: "Address",
                  value: attraction.address,
                },
                {
                  icon: Clock,
                  label: "Best time",
                  value: formatLabel(attraction.best_time_of_day),
                },
                {
                  icon: Ticket,
                  label: "Entrance",
                  value: attraction.entrance_fee_required
                    ? attraction.approx_entrance_fee || "Fee required"
                    : "Free",
                },
              ]}
            />

            <DestinationFeatureSection
              title="Activities"
              items={activities}
              emptyText="No activities available yet."
              icon={Activity}
              getMetaItems={(activity) => [
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
              ]}
            />

            <DestinationFeatureSection
              title="Cuisines"
              items={cuisines}
              emptyText="No cuisines available yet."
              icon={Utensils}
              getMetaItems={(cuisine) => [
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
              ]}
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
            <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-xs">
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
                    Visa notes
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {destination.visa_notes || "N/A"}
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
              </div>
            </div>

            {!!tags.length && (
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-xs">
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
              <MessageSquareDot size={18} />
              Start Planning
            </Button>
          </aside>
        </div>
      </section>

      <PlanningDrawer
        destination={destination}
        open={planningOpen}
        onOpenChange={setPlanningOpen}
      />
    </>
  );
};

export default DestinationDetailPage;
