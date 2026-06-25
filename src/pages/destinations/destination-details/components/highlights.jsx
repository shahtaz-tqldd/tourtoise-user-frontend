import React from "react";

// components
import CardSlider from "@/components/shared/card-slider";
import { DetailPill, SectionHeader } from "@/components/shared/utils";

// lib
import { formatLabel, getCloudinaryPreviewUrl } from "@/lib/utils";

// icons
import { Clock, MapPin, Star, Ticket, TreePalm } from "lucide-react";
import { Link } from "react-router-dom";

const DestinationHighlights = ({ destination, setActiveFeature }) => {
  const attractions = destination.attractions || [];

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

  const handleSelect = (item) => {
    setActiveFeature({
      title: "Attraction",
      icon: MapPin,
      item,
      metaItems: getAttractionMetaItems(item),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flbx">
        <SectionHeader
          icon={TreePalm}
          title="Top Attractions"
          description="Travel around the destination with amazing spots"
        />
        <Link
          to={`/destinations/${destination.slug}/attractions`}
          className="font-semibold text-sm text-slate-500"
        >
          View More
        </Link>
      </div>

      {attractions?.length ? (
        <CardSlider
          items={attractions}
          renderItem={(item) => (
            <HighlightItemCard item={item} onSelect={handleSelect} />
          )}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No attractions available yet.
        </div>
      )}
    </section>
  );
};

const HighlightItemCard = ({ item, onSelect }) => {
  const fallbackIcon = <MapPin size={34} />;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="relative h-full w-full aspect-[1] group overflow-hidden rounded-[24px] bg-white text-left shadow-xs outline-none ring-primary/30 transition hover:shadow-md focus-visible:ring-2"
    >
      {item.cover_image ? (
        <img
          src={getCloudinaryPreviewUrl(item.cover_image, 360)}
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
    </button>
  );
};

export default DestinationHighlights;
