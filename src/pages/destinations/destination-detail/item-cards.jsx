import React from "react";
import { formatLabel } from "@/lib/utils";
import {
  Activity,
  MapPin,
  Star,
  Clock,
  Utensils,
  WalletCards,
} from "lucide-react";
import { DetailPill } from "@/components/shared/utils";

export const AttractionCard = ({ item, onSelect }) => {
  const fallbackIcon = <MapPin size={34} />;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group h-full w-full overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[1] bg-slate-100">
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
          {item.is_featured && (
            <DetailPill>
              <Star
                size={12}
                className="mr-1 -translate-y-[1px] inline-block fill-current"
              />
              Featured
            </DetailPill>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <span className="text-xs uppercase font-medium tracking-wider">
            {item?.attraction_type}
          </span>
          <h3 className="font-semibold text-lg mt-0.5 mb-1 leading-tight truncate">
            {item.name}
          </h3>
        </div>
      </div>
    </button>
  );
};

export const ActivityCard = ({ item, onSelect }) => {
  const coverImage = item.cover_image || item.images?.[0]?.image_url;
  const meta_items = [
    {
      icon: Clock,
      label: "Duration",
      value: item.duration_hours
        ? `${item.duration_hours} hour${
            Number(item.duration_hours) === 1 ? "" : "s"
          }`
        : "Flexible",
    },
    {
      icon: WalletCards,
      label: "Cost",
      value: item.approx_cost
        ? `${item.approx_cost}${item.cost_unit ? ` ${item.cost_unit}` : ""}`
        : item.budget_tier
          ? formatLabel(item.budget_tier)
          : "Cost varies",
    },
  ];

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group h-full w-full overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
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
            {meta_items?.map((meta) => (
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

export const CuisineCard = ({ item, metaItems, onSelect }) => {
  const visibleMetaItems = metaItems.filter((meta) => meta.value).slice(0, 3);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group h-full w-full overflow-hidden rounded-[24px] bg-white p-4 text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[7/6] overflow-hidden bg-slate-100 rounded-xl">
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
        <div className="absolute left-3 top-3">
          {item.is_must_try && (
            <DetailPill>
              <Star
                size={12}
                className="mr-1 -translate-y-[1px] inline-block fill-current"
              />
              Must try
            </DetailPill>
          )}
        </div>
      </div>

      <div className="mt-4 ">
        <p className="text-xs font-semibold uppercase text-primary">
          {formatLabel(item.cuisine_type)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-medium leading-tight text-slate-950">
          {item.name}
        </h3>

        <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 text-xs font-semibold text-slate-600">
          {visibleMetaItems.map((meta) => (
            <DetailPill key={meta.label} className="flx gap-1">
              {React.createElement(meta.icon, {
                size: 12,
                className: "shrink-0 text-primary",
              })}
              <span className="truncate capitalize">{meta.value}</span>
            </DetailPill>
          ))}
        </div>
      </div>
    </button>
  );
};
