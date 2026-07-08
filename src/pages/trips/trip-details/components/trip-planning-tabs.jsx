import React, { useState } from "react";
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
  Plus,
  Route,
  ShieldCheck,
  Train,
  Upload,
} from "lucide-react";

import { SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import TabMenu from "@/components/ui/tab";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  { value: "packing", label: "Packing" },
  { value: "documents", label: "Documents" },
  { value: "route", label: "Route plan" },
  { value: "days", label: "Day wise plan" },
  { value: "heads-up", label: "Heads-up" },
  { value: "notes", label: "Notes" },
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
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          No packing items available yet.
        </p>
      )}
    </div>
  </Card>
);

const DocumentsSection = ({ documents = [], uploadedDocuments = [] }) => (
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
            className="rounded-lg border border-slate-200 p-4"
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
          </article>
        ))
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 md:col-span-2">
          No required documents available yet.
        </p>
      )}
    </div>

    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">Uploaded files</h3>
        <Button variant="outline" size="sm">
          <Upload size={15} />
          Upload
        </Button>
      </div>
      {uploadedDocuments.length ? (
        uploadedDocuments.map((document) => (
          <div
            key={document.name}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {document.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {document.type} uploaded {document.uploaded_at}
                </p>
              </div>
            </div>
            <span className="w-fit rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
              {document.status}
            </span>
          </div>
        ))
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          No uploaded documents yet.
        </p>
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
      <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
        No day-wise plan available yet.
      </p>
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
          <p className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
            No route plan available yet.
          </p>
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
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          No alerts available yet.
        </p>
      )}
    </div>
  </Card>
);

const NotesSection = ({ notes = [] }) => {
  const [activeNote, setActiveNote] = useState(null);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  return (
    <>
      <Card className="space-y-5">
        <SectionHeader
          icon={ShieldCheck}
          title="Notes"
          description="Additional information for this trip."
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{notes.length} saved notes</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateNoteOpen(true)}
          >
            <Plus size={15} />
            New note
          </Button>
        </div>

        <div className="space-y-4">
          {notes.length ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="cursor-pointer rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                onClick={() => setActiveNote(note)}
                aria-label={`View ${note.title}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {note.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      {note.body}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">{note.created_at}</p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No notes saved yet.
            </p>
          )}
        </div>
      </Card>
      <Dialog
        open={Boolean(activeNote)}
        onOpenChange={(open) => !open && setActiveNote(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeNote?.title}</DialogTitle>
            <DialogDescription>{activeNote?.created_at}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-slate-600">{activeNote?.body}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create note</DialogTitle>
            <DialogDescription>
              Add a planning note for documents, route, timing, or personal
              reminders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Textarea
              placeholder="Write a note..."
              className="min-h-36 resize-none rounded-xl border-slate-200"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsCreateNoteOpen(false)}>
              Create note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TripPlanningTabs = ({ trip }) => {
  const [activeTab, setActiveTab] = useState("packing");

  return (
    <section className="space-y-4">
      <TabMenu
        tabs={planningTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "packing" && <PackingSection items={trip.packing_items} />}
      {activeTab === "documents" && (
        <DocumentsSection
          documents={trip.documents}
          uploadedDocuments={trip.uploaded_documents}
        />
      )}
      {activeTab === "route" && <RouteSection segments={trip.route_segments} />}
      {activeTab === "days" && <DayPlanSection days={trip.days} />}
      {activeTab === "heads-up" && <HeadsupSection alerts={trip.alerts} />}
      {activeTab === "notes" && <NotesSection notes={trip.notes} />}
    </section>
  );
};

export default TripPlanningTabs;
