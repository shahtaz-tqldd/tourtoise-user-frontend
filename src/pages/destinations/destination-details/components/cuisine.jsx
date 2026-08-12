import React, { useState } from "react";
import CardSlider from "@/components/shared/card-slider";
import { DetailPill, Image, SectionHeader } from "@/components/shared/utils";
import { formatLabel } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Leaf,
  Soup,
  Star,
  Utensils,
} from "lucide-react";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

const getCuisineMetaItems = (cuisine) => [
  {
    icon: Utensils,
    label: "Meal",
    value: formatLabel(cuisine.meal_type),
  },
  {
    icon: Leaf,
    label: "Vegetarian",
    value: cuisine.is_vegetarian_friendly ? "Vegetarian friendly" : null,
  },
];

const DestinationCuisine = ({ destination, setActiveFeature }) => {
  const cuisines = destination.cuisines || [];
  const [isExpanded, setIsExpanded] = useState(false);
  const remainingCount = Math.max(cuisines.length - 3, 0);
  const desktopCuisines = isExpanded ? cuisines : cuisines.slice(0, 3);

  const handleSelect = (item) => {
    setActiveFeature({
      title: "Cuisine",
      icon: Utensils,
      featureType: "cuisines",
      item,
      metaItems: getCuisineMetaItems(item),
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <SectionHeader
          icon={Soup}
          title="Flavors to Explore"
          description="Local food worth trying while you are here"
        />
      </div>

      {cuisines?.length ? (
        <CardSlider
          items={cuisines}
          desktopItems={desktopCuisines}
          renderItem={(item) => (
            <CuisineCard
              item={item}
              metaItems={getCuisineMetaItems(item)}
              onSelect={handleSelect}
            />
          )}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No cuisines available yet.
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
            : `See ${remainingCount} more ${remainingCount === 1 ? "cuisine" : "cuisines"}`}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </section>
  );
};

export const CuisineCard = ({ item, metaItems, onSelect }) => {
  const visibleMetaItems = metaItems.filter((meta) => meta.value).slice(0, 3);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={item?.cover_image}
          alt={item?.name}
          className="transition duration-500 group-hover:scale-105"
          content_type={MEDIA_CONTENT_TYPE.CUISINE}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
        <div className="absolute left-3 top-3">
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
        <p className="text-xs font-semibold uppercase text-primary">
          {formatLabel(item.cuisine_type)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 min-h-10 font-medium leading-5 text-slate-950">
          {item.name}
        </h3>

        <div className="-mx-4 mt-auto border-t border-slate-100" />
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 text-xs font-semibold text-slate-600">
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

export default DestinationCuisine;
