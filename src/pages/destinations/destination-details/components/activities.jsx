import React, { useState } from "react";
import CardSlider from "@/components/shared/card-slider";
import { DetailPill, Image, SectionHeader } from "@/components/shared/utils";
import { formatLabel } from "@/lib/utils";
import {
  Activity,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Compass,
  Star,
} from "lucide-react";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

const getActivityMetaItems = (activity) => [
  {
    icon: CalendarCheck,
    label: "Booking",
    value: activity.booking_required
      ? "Booking Required"
      : "No Booking required",
  },
];

const DestinationFeatures = ({ destination, setActiveFeature }) => {
  const activities = destination.activities || [];
  const [isExpanded, setIsExpanded] = useState(false);
  const remainingCount = Math.max(activities.length - 3, 0);
  const desktopActivities = isExpanded ? activities : activities.slice(0, 3);

  const handleSelect = (item) => {
    setActiveFeature({
      title: "Activity",
      icon: Activity,
      featureType: "activities",
      item,
      metaItems: getActivityMetaItems(item),
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <SectionHeader
          icon={Compass}
          title="Things to Do"
          description="Experiences to add to your itinerary"
        />
      </div>

      {activities?.length ? (
        <CardSlider
          items={activities}
          desktopItems={desktopActivities}
          renderItem={(item) => (
            <ActivityCard item={item} onSelect={handleSelect} />
          )}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No activities available yet.
        </div>
      )}
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="mx-auto hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-xs transition hover:border-primary/30 hover:bg-primary/5 lg:flex"
        >
          {isExpanded
            ? "Show less"
            : `See ${remainingCount} more ${remainingCount === 1 ? "activity" : "activities"}`}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </section>
  );
};

const ActivityCard = ({ item, onSelect }) => {
  const coverImage = item.cover_image || item.images?.[0]?.image_url;
  const metaItems = getActivityMetaItems(item);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={coverImage}
          alt={item?.name}
          className="transition duration-500 group-hover:scale-105"
          content_type={MEDIA_CONTENT_TYPE.ACTIVITY}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          {item.is_featured && (
            <DetailPill variant="accent">
              <Star
                size={12}
                className="mr-1 -translate-y-[1px] inline-block fill-current"
              />
              Featured
            </DetailPill>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-primary text-xs uppercase font-semibold">
          {formatLabel(item.activity_type)}
        </p>
        <h3 className="mt-1.5 mb-3 line-clamp-2 min-h-10 font-medium leading-6 text-slate-950">
          {item.name}
        </h3>
        <div className="-mx-4 mt-auto border-t border-slate-100" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-600">
            {metaItems?.map((meta) => (
              <span
                key={meta.label}
                className="inline-flex items-center gap-1.5"
              >
                {React.createElement(meta.icon, {
                  size: 14,
                  className: "shrink-0 text-primary",
                })}
                <span className="truncate capitalize">{meta.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

export default DestinationFeatures;
