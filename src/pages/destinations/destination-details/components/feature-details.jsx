import React from "react";

import { Check, Clock, Currency, MapPin, Sun, Ticket } from "lucide-react";

import { formatLabel } from "@/lib/utils";

// comonents
import { DetailPill } from "@/components/shared/utils";
import ImagePreview from "@/components/shared/image-slider";
import SnapshotCard from "@/components/shared/snapshot-card";
import PreviewContent from "@/components/shared/preview-content";

const getFeatureType = (item) =>
  formatLabel(
    item?.attraction_type || item?.activity_type || item?.cuisine_type,
  );

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

  const images = [
    item.cover_image,
    ...feature.item.images.map((item) => item?.image_url),
  ];

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

  return (
    <div className="overflow-hidden bg-white">
      <ImagePreview images={images} />
      <div className="md:p-6 p-4">
        <div className="">
          <h4 className="text-xs font-semibold uppercase text-primary">
            {item?.attraction_type}
          </h4>
          <h2 className="mt-1 text-xl font-bold leading-tight">{item.name}</h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
            <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
            <span>{item.address}</span>
          </p>
          <p className="mt-4 leading-7 text-slate-600 text-sm">
            {item.description}
          </p>
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
              Reason to add {item.name} to your list
            </h3>
            <div className="mt-4 text-slate-600">
              {item.picking_reason_list?.length ? (
                <ul className="list-disc space-y-2">
                  {item.picking_reason_list.map((tip) => (
                    <li key={tip} className="flex gap-2 text-sm">
                      <Check size={14} className="text-primary mt-[3px]" />
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No cultural tips available.</p>
              )}
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-900">
              Consider this before going to {item.name}
            </h3>
            <div className="mt-4 text-slate-600">
              {item.tip_list?.length ? (
                <ul className="list-disc space-y-2">
                  {item.tip_list.map((tip) => (
                    <li key={tip} className="flex gap-2 text-sm">
                      <Check size={14} className="text-primary mt-[3px]" />
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No cultural tips available.</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-100 rounded-xl mt-4">
          <h3 className="text-sm font-bold">How to Reach</h3>
          <p className="mt-2 leading-7 text-slate-500 text-sm">
            {item.how_to_reach}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeatureDetails;
