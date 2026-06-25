import React from "react";
import CardSlider from "@/components/shared/card-slider";
import { DetailPill, SectionHeader } from "@/components/shared/utils";
import { formatLabel, getCloudinaryPreviewUrl } from "@/lib/utils";
import { Activity, Clock, Mountain, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

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
      ? `${activity.approx_cost}${activity.cost_unit ? ` ${activity.cost_unit}` : ""}`
      : formatLabel(activity.budget_tier),
  },
];

const DestinationFeatures = ({ destination, setActiveFeature }) => {
  const activities = destination.activities || [];

  const handleSelect = (item) => {
    setActiveFeature({
      title: "Activity",
      icon: Activity,
      item,
      metaItems: getActivityMetaItems(item),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flbx">
        <SectionHeader
          icon={Mountain}
          title="Featured Activities"
          description="Activites those are to do around here"
        />
        <Link
          to={`/destinations/${destination.slug}/activities`}
          className="font-semibold text-sm text-slate-500"
        >
          View More
        </Link>
      </div>

      {activities?.length ? (
        <CardSlider
          items={activities}
          renderItem={(item) => (
            <ActivityCard item={item} onSelect={handleSelect} />
          )}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No activities available yet.
        </div>
      )}
    </section>
  );
};

const ActivityCard = ({ item, onSelect }) => {
  const coverImage = item.cover_image || item.images?.[0]?.image_url;
  const metaItems = getActivityMetaItems(item).map((meta) => ({
    ...meta,
    value:
      meta.label === "Duration"
        ? meta.value || "Flexible"
        : meta.value || "Cost varies",
  }));

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group h-full w-full overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={getCloudinaryPreviewUrl(coverImage, 360)}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <Activity size={30} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          {item.difficulty_level && (
            <DetailPill>{formatLabel(item.difficulty_level)}</DetailPill>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-primary text-xs uppercase font-semibold">
          {formatLabel(item.activity_type)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-medium leading-tight text-slate-950">
          {item.name}
        </h3>
        <div className="border-t border-slate-100 -mx-4 my-3"></div>
        <div className="flex items-center justify-between gap-3">
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
