import React, { useState } from "react";

// components
import CardSlider from "@/components/shared/card-slider";
import { DetailPill, Image, SectionHeader } from "@/components/shared/utils";

// lib
import { formatLabel } from "@/lib/utils";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

// icons
import {
  ChevronDown,
  ChevronUp,
  Landmark,
  MapPin,
  Star,
  Tags,
} from "lucide-react";

const DestinationHighlights = ({ destination, setActiveFeature }) => {
  const attractions = destination.attractions || [];
  const [isExpanded, setIsExpanded] = useState(false);
  const remainingCount = Math.max(attractions.length - 3, 0);
  const desktopAttractions = isExpanded ? attractions : attractions.slice(0, 3);

  const getAttractionMetaItems = (attraction) => [
    {
      icon: MapPin,
      label: "Type",
      value: formatLabel(attraction.attraction_type),
    },
    { icon: MapPin, label: "Address", value: attraction.address },
    { icon: Tags, label: "Tags", value: attraction.tags?.length },
  ];

  const handleSelect = (item) => {
    setActiveFeature({
      title: "Attraction",
      icon: Landmark,
      featureType: "attractions",
      item,
      metaItems: getAttractionMetaItems(item),
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <SectionHeader
          icon={Landmark}
          title="Top Attractions"
          description="Discover the places worth making time for"
        />
      </div>

      {attractions?.length ? (
        <CardSlider
          items={attractions}
          desktopItems={desktopAttractions}
          renderItem={(item) => (
            <HighlightItemCard item={item} onSelect={handleSelect} />
          )}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No attractions available yet.
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
            : `See ${remainingCount} more ${remainingCount === 1 ? "attraction" : "attractions"}`}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </section>
  );
};

const HighlightItemCard = ({ item, onSelect }) => {
  const tags = (item.tags || []).filter(Boolean).slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group h-full w-full overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <Image
          src={item.cover_image}
          alt={item.name}
          className="transition duration-500 group-hover:scale-105"
          content_type={MEDIA_CONTENT_TYPE.ATTRACTION}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/20" />
        {item.is_featured && (
          <div className="absolute left-3 top-3">
            <DetailPill variant="accent">
              <Star
                size={12}
                className="mr-1 -translate-y-[1px] inline-block fill-current"
              />
              Featured
            </DetailPill>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold uppercase text-primary">
          {formatLabel(item?.attraction_type)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-medium leading-tight text-slate-950">
          {item.name}
        </h3>

        {item.address && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <MapPin size={13} className="shrink-0 text-primary" />
            <span className="truncate">{item.address}</span>
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
            {tags.map((tag) => {
              const label =
                typeof tag === "string"
                  ? formatLabel(tag)
                  : tag.name || formatLabel(tag.slug);

              return (
                <span
                  key={tag.slug || tag.name || tag}
                  className="max-w-full truncate rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </button>
  );
};

export default DestinationHighlights;
