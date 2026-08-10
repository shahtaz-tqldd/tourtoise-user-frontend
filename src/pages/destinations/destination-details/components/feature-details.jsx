import React from "react";

import {
  Activity,
  Check,
  Clock,
  Currency,
  Flame,
  MapPin,
  Sun,
  TreePalm,
  Utensils,
} from "lucide-react";

import { formatLabel } from "@/lib/utils";

// comonents
import { DetailPill } from "@/components/shared/utils";
import ImagePreview from "@/components/shared/image-slider";
import SnapshotCard from "@/components/shared/snapshot-card";
import PreviewContent from "@/components/shared/preview-content";
import { formatMonths } from "@/lib/date-time";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

const getFeatureType = (item) =>
  formatLabel(
    item?.attraction_type || item?.activity_type || item?.cuisine_type,
  );

const formatHours = (value) => {
  if (!value) return null;

  return `${value} hour${Number(value) === 1 ? "" : "s"}`;
};

const formatCost = (value) => {
  if (!value) return null;

  const cost = value.toString();
  const numericCost = cost.replaceAll(",", "");

  if (/[a-z]/i.test(cost)) return cost;
  if (!/^\d+(\.\d+)?$/.test(numericCost)) return cost;

  return `${Number(numericCost).toLocaleString()} IDR`;
};

const formatSeason = (value) => {
  if (!value) return null;
  const months = value.toString().split(";").filter(Boolean).map(Number);
  return months;
};

const getFeatureCategory = (item) => {
  if (item?.attraction_type) return "attraction";
  if (item?.activity_type) return "activity";
  if (item?.cuisine_type) return "cuisine";

  return "feature";
};

const getSnapshotFeatures = (item) => {
  const category = getFeatureCategory(item);

  if (category === "activity") {
    return [
      {
        label: "Difficulty",
        value: formatLabel(item.difficulty_level),
        icon: TreePalm,
      },
      {
        label: "Duration",
        value: formatHours(item.duration_hours),
        icon: Clock,
      },
      {
        label: "Cost",
        value: formatCost(item.approx_cost) || formatLabel(item.budget_tier),
        icon: Currency,
      },
      {
        label: "Best Time",
        value: formatMonths(formatSeason(item.best_season)),
        icon: Activity,
      },
    ];
  }

  if (category === "cuisine") {
    return [
      {
        label: "Meal Type",
        value: formatLabel(item.meal_type),
        icon: Clock,
      },
      {
        label: "Spice",
        value: formatLabel(item.spice_level),
        icon: Flame,
      },
      {
        label: "Cost",
        value: formatCost(item.approx_cost) || item.approx_price_range,
        icon: Currency,
      },
      {
        label: "Vegetarian Friendly",
        value: item.is_vegetarian_friendly ? "Yes" : "No",
        icon: Utensils,
      },
    ];
  }

  return [
    {
      label: "Attraction Type",
      value: formatLabel(item?.attraction_type),
      icon: TreePalm,
    },
    {
      label: "Budget",
      value: formatLabel(item?.budget_tier),
      icon: Currency,
    },
    {
      label: "Average Duration",
      value: formatHours(item?.avg_duration_hours),
      icon: Clock,
    },
    {
      label: "Best Time of Day",
      value: formatLabel(item?.best_time_of_day),
      icon: Sun,
    },
  ];
};

const getExtraSections = (item) => {
  const category = getFeatureCategory(item);

  if (category === "activity") {
    return [
      {
        title: "Booking",
        body: item.booking_required ? "Booking required" : "Booking optional",
      },
    ];
  }

  if (category === "cuisine") {
    return [];
  }

  return [
    {
      title: "How to Reach",
      body: item.how_to_reach,
    },
    {
      title: "Approximate Entrance Fee",
      body:
        item.entrance_fee_required === false
          ? "Free"
          : item.approx_entrance_fee,
    },
  ].filter((section) => section.body);
};

const FeatureDetails = ({ feature, open, onOpenChange }) => {
  return (
    <PreviewContent open={open} onOpenChange={onOpenChange}>
      <FeatureDetailContent feature={feature} />
    </PreviewContent>
  );
};

function FeatureDetailContent({ feature }) {
  if (!feature) return null;

  const { item } = feature;
  const type = getFeatureType(item);
  const category = getFeatureCategory(item);

  const images = [
    item.cover_image,
    ...(item.images || []).map((image) => image?.image_url),
  ].filter(Boolean);
  const features = getSnapshotFeatures(item).filter((feature) => feature.value);
  const extraSections = getExtraSections(item);
  const tags = item.tags || [];
  const leadLine = item.address || type;

  let content_type = MEDIA_CONTENT_TYPE.ATTRACTION;
  if (category === "cuisine") {
    content_type = MEDIA_CONTENT_TYPE.CUISINE;
  } else if (category === "activity") {
    content_type = MEDIA_CONTENT_TYPE.ACTIVITY;
  }

  return (
    <div className="overflow-hidden bg-white pt-3 md:pt-0">
      <ImagePreview images={images} content_type={content_type} />
      <div className="md:p-6 p-4">
        <div className="">
          <DetailPill variant="alert">{feature.title || type}</DetailPill>
          <h2 className="mt-2 text-xl font-bold leading-tight">{item.name}</h2>
          {leadLine && (
            <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
              {category === "cuisine" ? (
                <>
                  <Utensils
                    size={14}
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <span className="capitalize">{type} Cuisine</span>
                </>
              ) : category === "activity" ? (
                <>
                  <Activity
                    size={14}
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <span className="capitalize">{type}</span>
                </>
              ) : (
                <>
                  <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                  <span className="capitalize">{item.address} </span>
                </>
              )}
            </p>
          )}
          <p className="mt-4 leading-7 text-slate-600 text-sm">
            {item.description}
          </p>
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <DetailPill key={tag.slug || tag.name}>
                  {tag.name || formatLabel(tag.slug)}
                </DetailPill>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-sm font-semibold mb-2 mt-4">Quick Snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((item, index) => (
            <SnapshotCard
              className="border border-slate-200 rounded-xl p-4"
              key={index}
              {...item}
            />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-900">
              Reasons to add {item.name} to your list
            </h3>
            <div className="mt-4 text-slate-600">
              {item.picking_reasons?.length ? (
                <ul className="list-disc space-y-2">
                  {item.picking_reasons.map((tip) => (
                    <li key={tip} className="flex gap-2 text-sm">
                      <Check size={14} className="text-primary mt-[3px]" />
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No reasons available.</p>
              )}
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 overflow-hidden">
            <h3 className="font-bold text-slate-900">
              Consider this before choosing {item.name}
            </h3>
            <div className="mt-4 text-slate-600">
              {item.notes?.length ? (
                <ul className="list-disc space-y-2">
                  {item.notes.map((tip) => (
                    <li key={tip} className="flex gap-2 text-sm">
                      <Check size={14} className="text-primary mt-[3px]" />
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No notes available.</p>
              )}
            </div>
          </div>
        </div>
        {extraSections.map((section) => (
          <div key={section.title} className="p-4 bg-slate-100 rounded-xl mt-4">
            <h3 className="text-sm font-bold">{section.title}</h3>
            <p className="mt-2 leading-7 text-slate-500 text-sm">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureDetails;
