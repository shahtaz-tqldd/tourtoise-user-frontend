import { useTripPreparationQuery } from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  AlertTriangle,
  Backpack,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const tabs = [
  { key: "packing", label: "Packing", icon: Backpack },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "heads_up", label: "Heads up", icon: ShieldAlert },
];

const priorityStyles = {
  essential: "bg-red-50 text-red-700 border-red-100",
  recommended: "bg-primary/10 text-primary border-primary/10",
  optional: "bg-slate-100 text-slate-600 border-slate-200",
};

const documentLevelStyles = {
  required: "bg-red-50 text-red-700 border-red-100",
  recommended: "bg-primary/10 text-primary border-primary/10",
  optional: "bg-slate-100 text-slate-600 border-slate-200",
};

const severityStyles = {
  high: "bg-red-50 text-red-700 border-red-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const unwrapPreparation = (response) => response?.data || response || {};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const groupBy = (items, key) =>
  items.reduce((groups, item) => {
    const groupKey = item[key] || "other";

    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), item],
    };
  }, {});

const PrepSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
      <div className="mb-3 h-5 w-2/3 animate-pulse rounded-full bg-primary/10" />
      <div className="h-3 w-full animate-pulse rounded-full bg-primary/10" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
    {[0, 1, 2, 3].map((index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="mb-3 h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
      </div>
    ))}
  </div>
);

const StatusPill = ({ value, styles }) => (
  <span
    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
      styles[value] || "border-slate-200 bg-slate-100 text-slate-600"
    }`}
  >
    {formatLabel(value)}
  </span>
);

const SectionHeader = ({ title, count }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
      {count} item{count === 1 ? "" : "s"}
    </span>
  </div>
);

const PackingList = ({ items }) => {
  const groupedItems = groupBy(items, "category");

  return (
    <div className="space-y-4">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div
          key={category}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <SectionHeader
            title={formatLabel(category)}
            count={categoryItems.length}
          />
          <div className="space-y-3">
            {categoryItems.map((item) => (
              <div
                key={`${category}-${item.item}`}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white">
                  <CheckCircle2 size={13} className="text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">
                      {item.item}
                    </p>
                    <StatusPill value={item.priority} styles={priorityStyles} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const DocumentsList = ({ items }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div
        key={item.document}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="center mt-0.5 size-8 shrink-0 rounded-full bg-primary/10 text-primary">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {item.document}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.reason}
              </p>
            </div>
          </div>
          <StatusPill
            value={item.required_level}
            styles={documentLevelStyles}
          />
        </div>
      </div>
    ))}
  </div>
);

const HeadsUpList = ({ items }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div
        key={`${item.category}-${item.title}`}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex items-start gap-3">
          <div className="center mt-0.5 size-8 shrink-0 rounded-full bg-amber-50 text-amber-700">
            <AlertTriangle size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {item.title}
                </p>
                <p className="mt-1 text-xs font-medium uppercase text-slate-400">
                  {formatLabel(item.category)}
                </p>
              </div>
              <StatusPill value={item.severity} styles={severityStyles} />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.details}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
    {children}
  </div>
);

const TripPreparationStep = ({ trip }) => {
  const tripId = getTripId(trip);
  const [activeTab, setActiveTab] = useState("packing");
  const { data, isLoading, isFetching, isError } = useTripPreparationQuery(
    tripId ? { trip_id: tripId } : skipToken,
  );
  const preparation = useMemo(() => unwrapPreparation(data), [data]);
  const packingItems = preparation.packing_items || [];
  const documents = preparation.required_documents || [];
  const headsUp = preparation.heads_up || [];

  if (isLoading || isFetching) {
    return <PrepSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Could not load the preparation guide. Try reopening this step in a
        moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="center mt-0.5 size-8 shrink-0 rounded-full bg-white text-primary">
            <Sparkles size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {preparation.title || "Documents and packup"}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {preparation.summary || preparation.message}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/40"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "packing" &&
        (packingItems.length ? (
          <PackingList items={packingItems} />
        ) : (
          <EmptyState>No packing items available.</EmptyState>
        ))}

      {activeTab === "documents" &&
        (documents.length ? (
          <DocumentsList items={documents} />
        ) : (
          <EmptyState>No documents listed yet.</EmptyState>
        ))}

      {activeTab === "heads_up" &&
        (headsUp.length ? (
          <HeadsUpList items={headsUp} />
        ) : (
          <EmptyState>No heads-up notes available.</EmptyState>
        ))}

      {preparation.revision_instruction && (
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
          {preparation.revision_instruction}
        </div>
      )}

      {preparation.is_preparation_complete && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
          Preparation guide is complete. Review your packing list, documents,
          and important travel notes before locking the plan.
        </div>
      )}
    </div>
  );
};

export default TripPreparationStep;
