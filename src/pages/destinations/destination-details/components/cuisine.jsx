import React from "react";
import CardSlider from "@/components/shared/card-slider";
import { DetailPill, SectionHeader } from "@/components/shared/utils";
import { formatLabel, getCloudinaryPreviewUrl } from "@/lib/utils";
import { Activity, Star, Utensils, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

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

const DestinationCuisine = ({ destination, setActiveFeature }) => {
  const cuisines = destination.cuisines || [];

  const handleSelect = (item) => {
    setActiveFeature({
      title: "Cuisine",
      icon: Utensils,
      item,
      metaItems: getCuisineMetaItems(item),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flbx">
        <SectionHeader
          icon={Utensils}
          title="Local Cuisine"
          description="These are the cuisines you should definitely try"
        />
        <Link
          to={`/destinations/${destination.slug}/cuisines`}
          className="font-semibold text-sm text-slate-500"
        >
          View More
        </Link>
      </div>

      {cuisines?.length ? (
        <CardSlider
          items={cuisines}
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
    </section>
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
            src={getCloudinaryPreviewUrl(item.cover_image, 360)}
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

export default DestinationCuisine;
