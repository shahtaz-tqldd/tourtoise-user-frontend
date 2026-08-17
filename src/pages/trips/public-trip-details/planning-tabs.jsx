import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Backpack,
  CalendarDays,
  FileCheck2,
  Route,
} from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { PreviewCard } from "@/components/ui/card";
import TabMenu from "@/components/ui/tab";
import TripDayWisePlan from "../trip-details/components/day-wise-plan";
import TripRoutePlan from "../trip-details/components/route-plan";

const tabs = [
  { value: "packing", label: "Packing", icon: Backpack },
  { value: "documents", label: "Documents", icon: FileCheck2 },
  { value: "heads-up", label: "Heads-up", icon: AlertTriangle },
  { value: "route", label: "Route", icon: Route },
  { value: "days", label: "Day Wise Plan", icon: CalendarDays },
];

const priorityStyles = {
  essential: "bg-red-100 text-red-700",
  required: "bg-red-100 text-red-700",
  recommended: "bg-primary/10 text-primary",
  conditional: "bg-orange-100 text-orange-600",
  optional: "bg-orange-100 text-orange-600",
};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const ReadOnlyPacking = ({ items = [] }) => (
  <PreviewCard className="space-y-5 md:rounded-t-none">
    <SectionHeader
      icon={Backpack}
      title="Packing"
      description="Essentials recommended for this trip."
    />

    {items.length ? (
      <div className="space-y-3 md:space-y-4">
        {items.map((item, index) => (
          <article
            key={`${item.item}-${index}`}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.item}
                  </h3>
                  {Number(item.quantity) > 1 && (
                    <span className="center size-5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {item.quantity}
                    </span>
                  )}
                </div>
                {item.additional_notes && (
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {item.additional_notes}
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                    {formatLabel(item.category)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      priorityStyles[item.priority] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {formatLabel(item.priority)}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <EmptyState
        title="Empty packing list"
        description="No packing items were included in this trip."
      />
    )}
  </PreviewCard>
);

const ReadOnlyDocuments = ({ documents = [] }) => (
  <PreviewCard className="space-y-5 md:rounded-t-none">
    <SectionHeader
      icon={FileCheck2}
      title="Documents"
      description="Documents recommended for this trip."
    />

    {documents.length ? (
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {documents.map((document, index) => {
          const name =
            document.document_name || document.document || document.name;
          const level = document.required_level || document.status;
          const note =
            document.additional_note || document.reason || document.note;

          return (
            <article
              key={`${name}-${index}`}
              className="h-full rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  {name}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    priorityStyles[level] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {formatLabel(level)}
                </span>
              </div>
              {note && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
              )}
            </article>
          );
        })}
      </div>
    ) : (
      <EmptyState
        title="Empty document list"
        description="No document requirements were included in this trip."
      />
    )}
  </PreviewCard>
);

const ReadOnlyHeadsUp = ({ items = [] }) => (
  <PreviewCard className="space-y-5 md:rounded-t-none">
    <SectionHeader
      icon={AlertTriangle}
      title="Heads-up"
      description="Important information to consider for this trip."
    />

    {items.length ? (
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {items.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className="h-full rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
              {item.severity && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.severity === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {formatLabel(item.severity)}
                </span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
              {item.additional_note || item.details || item.note}
            </p>
          </article>
        ))}
      </div>
    ) : (
      <EmptyState
        title="No heads-up information"
        description="No alerts were included in this trip."
      />
    )}
  </PreviewCard>
);

const PublicTripPlanningTabs = ({ trip }) => {
  const [activeTab, setActiveTab] = useState("packing");
  const contentRef = useRef(null);
  const previousActiveTabRef = useRef(activeTab);

  useEffect(() => {
    if (previousActiveTabRef.current === activeTab) return;

    previousActiveTabRef.current = activeTab;
    const frame = requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeTab]);

  return (
    <section>
      <TabMenu
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="sticky top-0 z-20 -mx-2.5 rounded-t-2xl bg-white/90 px-4 pt-2 backdrop-blur-xl md:top-0 md:mx-0 md:px-0"
      />

      <div ref={contentRef} className="scroll-mt-28">
        {activeTab === "packing" && (
          <ReadOnlyPacking items={trip.packing_items} />
        )}
        {activeTab === "documents" && (
          <ReadOnlyDocuments documents={trip.required_documents} />
        )}
        {activeTab === "heads-up" && (
          <ReadOnlyHeadsUp items={trip.heads_up} />
        )}
        {activeTab === "route" && <TripRoutePlan routes={trip.routes} />}
        {activeTab === "days" && (
          <TripDayWisePlan
            days={trip.days}
            description="A readable daily structure for every day of the trip."
            showCompletion={false}
          />
        )}
      </div>
    </section>
  );
};

export default PublicTripPlanningTabs;
