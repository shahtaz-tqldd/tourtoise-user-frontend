import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  Backpack,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileText,
  Plane,
  Route,
  Train,
  Upload,
} from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/shared/utils";
import Card from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import TabMenu from "@/components/ui/tab";

import TripNotes from "./trip-notes";

const modeIcons = {
  car: Car,
  ferry: Plane,
  bus: Bus,
  train: Train,
};

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const planningTabs = [
  { value: "packing", label: "Packing", icon: Backpack },
  { value: "documents", label: "Documents", icon: FileCheck2 },
  { value: "route", label: "Route", icon: Route },
  { value: "days", label: "Days", icon: CalendarDays },
  { value: "heads-up", label: "Heads-up", icon: AlertTriangle },
  { value: "notes", label: "Notes", icon: FileText },
];

const PackingSection = ({ items = [] }) => (
  <Card className="space-y-5">
    <SectionHeader
      icon={Backpack}
      title="Packing"
      description="Track essentials before the trip is locked."
    />
    <div className="grid gap-2">
      {items.length ? (
        items.map((item) => (
          <label
            key={item.label}
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700"
          >
            <Checkbox defaultChecked={item.packed} />
            <span>
              {item.label}
              {item.note && (
                <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                  {item.note}
                </span>
              )}
            </span>
          </label>
        ))
      ) : (
        <EmptyState
          title="Empty Packing items"
          description="You have no packing items added in this trip yet!"
        />
      )}
    </div>
  </Card>
);

const DocumentsSection = ({ documents = [] }) => (
  <Card className="space-y-5">
    <SectionHeader
      icon={FileCheck2}
      title="Documents"
      description="Manage required documents and personal uploads from one place."
    />

    <div className="grid gap-3 md:grid-cols-2">
      {documents.length ? (
        documents.map((document) => (
          <article
            key={document.name}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">
                  {document.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{document.note}</p>
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                {document.status}
              </span>
            </div>
            <div className="mt-4">
              <button className="flx gap-1.5 bg-primary/10 hover:bg-primary/15 tr py-1.5 pl-2.5 pr-3 rounded-md text-primary">
                <Upload size={12} />
                <span className="text-xs font-semibold">Upload</span>
              </button>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="Empty Document list"
          description="You have no document list added in this trip yet!"
          className="md:col-span-2"
        />
      )}
    </div>
  </Card>
);

const DetailList = ({ title, items = [] }) => (
  <div className="rounded-lg border border-slate-200 p-3">
    <p className="text-sm font-semibold text-slate-950">{title}</p>
    <div className="mt-3 grid gap-2">
      {items.length ? (
        items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2 text-sm text-slate-600"
          >
            <CheckCircle2 size={15} className="mt-0.5 text-primary" />
            <span>{item}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">No items listed.</p>
      )}
    </div>
  </div>
);

const DayAccordion = ({ days }) => {
  const [openDay, setOpenDay] = useState(days[0]?.day);

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const isOpen = openDay === day.day;

        return (
          <article key={day.day} className="rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setOpenDay(isOpen ? null : day.day)}
              className="flex w-full items-start justify-between gap-4 p-4 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase text-primary">
                  Day {day.day} - {formatDate(day.date)}
                </p>
                <h3 className="mt-1 font-semibold text-slate-950">
                  {day.title}
                </h3>
              </div>
              <ChevronDown
                size={18}
                className={`mt-1 shrink-0 text-slate-400 transition ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="space-y-4 border-t border-slate-200 p-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Route size={16} className="text-primary" />
                    Roam around route
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {day.roam_route}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <DetailList
                    title="Attractions to visit"
                    items={day.attractions}
                  />
                  <DetailList title="Activities to do" items={day.activities} />
                </div>

                <div className="grid gap-2">
                  {day.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 size={15} className="mt-0.5 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

const DayPlanSection = ({ days = [] }) => (
  <Card className="space-y-5">
    <SectionHeader
      icon={CalendarDays}
      title="Day wise plan"
      description="A readable daily structure that the agent can continue refining."
    />
    {days.length ? (
      <DayAccordion days={days} />
    ) : (
      <EmptyState
        title="No day-wise Plans"
        description="You have no day-wise plan has added in this trip yet!"
      />
    )}
  </Card>
);

const RouteSection = ({ segments = [] }) => (
  <Card className="space-y-5">
    <SectionHeader
      icon={Route}
      title="Route"
      description="Visual movement plan showing origin, destination, vehicle, and timing."
    />
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="relative space-y-4">
        {segments.length ? (
          segments.map((segment, index) => {
            const Icon = modeIcons[segment.mode] || Route;

            return (
              <div
                key={`${segment.from}-${segment.to}`}
                className="relative flex gap-4"
              >
                {index < segments.length - 1 && (
                  <span className="absolute left-5 top-11 h-[calc(100%+1rem)] w-px bg-slate-300" />
                )}
                <div className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-slate-200">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1 rounded-lg bg-white p-4 ring-1 ring-slate-200">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {segment.from} to {segment.to}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {segment.note}
                      </p>
                    </div>
                    <span className="w-fit rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                      {segment.mode} - {segment.duration}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No Route plans"
            description="You have no route-plan added in this trip yet!"
          />
        )}
      </div>
    </div>
  </Card>
);

const HeadsupSection = ({ alerts = [] }) => (
  <Card className="space-y-5">
    <SectionHeader
      icon={AlertTriangle}
      title="Heads-up"
      description="Important information to consider for this trip."
    />

    <div className="space-y-4">
      {alerts.length ? (
        alerts.map((alert) => (
          <article
            key={alert.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {alert.title}
              </h3>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold capitalize text-amber-700">
                {alert.severity}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{alert.body}</p>
          </article>
        ))
      ) : (
        <EmptyState
          title="No Alerts or Notifications"
          description="You have no heads-up info added in this trip yet!"
        />
      )}
    </div>
  </Card>
);

const TripPlanningTabs = ({ trip }) => {
  const [activeTab, setActiveTab] = useState("packing");
  const contentRef = useRef(null);

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) {
      return;
    }

    setActiveTab(nextTab);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <section className="space-y-4">
      <TabMenu
        tabs={planningTabs}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        scrollable
        className="sticky top-[106px] z-20 -mx-4 bg-white/90 px-4 pt-2 backdrop-blur-xl md:top-16 md:mx-0 md:px-0"
      />

      <div ref={contentRef} className="scroll-mt-[168px] md:scroll-mt-28">
        {activeTab === "packing" && (
          <PackingSection items={trip.packing_items} />
        )}
        {activeTab === "documents" && (
          <DocumentsSection
            documents={trip.documents}
            uploadedDocuments={trip.uploaded_documents}
          />
        )}
        {activeTab === "route" && (
          <RouteSection segments={trip.route_segments} />
        )}
        {activeTab === "days" && <DayPlanSection days={trip.days} />}
        {activeTab === "heads-up" && <HeadsupSection alerts={trip.alerts} />}
        {activeTab === "notes" && <TripNotes tripId={trip.id} />}
      </div>
    </section>
  );
};

export default TripPlanningTabs;
