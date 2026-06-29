import React, { useEffect, useRef, useState } from "react";

// ui components
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
import {
  CalendarDays,
  Clock,
  Currency,
  MapPin,
  Star,
  Sun,
  Ticket,
} from "lucide-react";

import { formatLabel } from "@/lib/utils";

// comonents
import { DetailPill } from "@/components/shared/utils";
import ImagePreview from "@/components/shared/image-slider";
import SnapshotCard from "@/components/shared/snapshot-card";

const getFeatureType = (item) =>
  formatLabel(
    item?.attraction_type || item?.activity_type || item?.cuisine_type,
  );

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

const FeatureDetails = ({ feature, open, onOpenChange }) => {
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
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-2xl border-none rounded-3xl custom-scrollbar">
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
};

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

function FeatureDetailContent({ feature }) {
  if (!feature) return null;

  const { item, icon: Icon, metaItems, title } = feature;
  const fallbackIcon = React.createElement(Icon, { size: 38 });
  const type = getFeatureType(item);

  const images = [
    item.cover_image,
    ...feature.item.images.map((item) => item?.image_url),
  ];

  console.log(feature);

  const features = [
    {
      label: "Budget",
      value: feature?.item?.budget_tier || "Average",
      icon: Currency,
    },
    {
      label: "Average Duration",
      value: feature?.item?.avg_duration_hours,
      icon: Clock,
    },
    {
      label: "Best Time of Day",
      value: feature?.item?.best_time_of_day,
      icon: Sun,
    },
    {
      label: "Entrance Fee",
      value: feature?.item?.approx_entrance_fee,
      icon: Ticket,
    },
  ];

  // "attraction_type": "natural_site",
  // "how_to_reach": "You need to treck",
  // "latitude": -8.4113,
  // "longitude": 116.4573,

  // "picking_reason_list": [
  //     "Best for trecking"
  // ],
  // "tip_list": [
  //     "Never get too long here"
  // ],

  // "entrance_fee_required": true,
  // "is_featured": true,

  return (
    <div className="overflow-hidden bg-white">
      <ImagePreview images={images} />
      <div className="p-6">
        <div className="">
          <h4 className="text-xs font-semibold uppercase text-slate-400">
            {title}
          </h4>
          <h2 className="mt-1 text-xl font-bold leading-tight">{item.name}</h2>
          <p className=" mt-2 flex items-start gap-2 text-sm">
            <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
            <span>{item.address}</span>
          </p>
          <p className="mt-4 leading-7 text-slate-500">{item.description}</p>
        </div>

        <h2 className="text-sm font-semibold mb-2 mt-4">Quick Snapshot</h2>
        <div className="grid grid-cols-4 gap-2">
          {features.map((item, index) => (
            <SnapshotCard
              className="border border-slate-200 rounded-xl p-3"
              key={index}
              {...item}
            />
          ))}
        </div>
      </div>
      {/* <div className="relative aspect-[16/10] max-h-[340px] w-full bg-slate-100">
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
      </div> */}

      <div className="space-y-5 p-5">
        {(item.best_time_to_visit || item.tips) && (
          <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
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

export default FeatureDetails;
