import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/ui/status";
import TabMenu from "@/components/ui/tab";
import { Textarea } from "@/components/ui/textarea";
import { useTripDetailQuery } from "@/features/trips/tripApiSlice";
import {
  AlertTriangle,
  Backpack,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  MapPin,
  MessageSquareDot,
  Plane,
  Plus,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  Train,
  Upload,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

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

const formatMoney = (amount, currency) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const unwrapTripDetail = (response) => response?.data || response;

const normalizeTransportMode = (mode = "") => {
  const normalizedMode = mode.toLowerCase();

  if (normalizedMode.includes("bus")) return "bus";
  if (normalizedMode.includes("train")) return "train";
  if (normalizedMode.includes("ferry") || normalizedMode.includes("boat")) {
    return "ferry";
  }
  if (normalizedMode.includes("car") || normalizedMode.includes("transfer")) {
    return "car";
  }

  return normalizedMode || "route";
};

const formatTime = (value) => {
  if (!value) return "";
  if (!value.includes(":")) return value;

  const [hour, minute] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour || 0), Number(minute || 0), 0, 0);

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const buildChatMessages = (trip) => {
  const context = trip?.agent_context || {};
  const messages = [
    context.preference_qna?.context && {
      role: "agent",
      content: context.preference_qna.context,
    },
    context.recommendations?.messages?.attractions && {
      role: "agent",
      content: context.recommendations.messages.attractions,
    },
    context.recommendations?.messages?.activities && {
      role: "agent",
      content: context.recommendations.messages.activities,
    },
    context.recommendations?.messages?.cuisines && {
      role: "agent",
      content: context.recommendations.messages.cuisines,
    },
    context.itinerary_design?.message && {
      role: "agent",
      content: context.itinerary_design.message,
    },
    context.trip_preparation?.message && {
      role: "agent",
      content: context.trip_preparation.message,
    },
  ].filter(Boolean);

  return messages;
};

const normalizeTripDetail = (sourceTrip) => {
  if (!sourceTrip) return null;

  const itinerary = sourceTrip.agent_context?.itinerary_design || {};
  const preparation = sourceTrip.agent_context?.trip_preparation || {};
  const preferences = sourceTrip.preferences || {};
  const routePlan = itinerary.route_plan || [];
  const preparationDocuments = preparation.required_documents || [];
  const packingItems = preparation.packing_items || [];
  const headsUp = preparation.heads_up || [];
  const days = sourceTrip.days?.length
    ? sourceTrip.days
    : itinerary.day_wise_plan || [];

  return {
    ...sourceTrip,
    overview:
      itinerary.summary ||
      preparation.summary ||
      sourceTrip.planning_summary ||
      "No planning summary available yet.",
    trip_pace: preferences.travel_pace || sourceTrip.traveler_type || "custom",
    destinations: (sourceTrip.trip_destinations || []).map((destination) => ({
      name:
        destination.destination?.name ||
        destination.name ||
        destination.title ||
        sourceTrip.title,
      country: destination.destination?.country || destination.country || "",
      stay: destination.stay || destination.role || "Trip destination",
      image_url:
        destination.destination?.cover_image ||
        destination.cover_image ||
        destination.image_url,
      summary:
        destination.destination?.overview ||
        destination.summary ||
        sourceTrip.planning_summary,
    })),
    packing_items: packingItems.map((item) => ({
      label: item.item || item.label,
      packed: item.packed || false,
      note: item.reason,
    })),
    documents: preparationDocuments.map((document) => ({
      name: document.document || document.name,
      status: document.required_level || document.status || "required",
      note: document.reason || document.note,
    })),
    uploaded_documents: sourceTrip.uploaded_documents || [],
    route_segments: routePlan.map((segment) => ({
      from: segment.from_point,
      to: segment.to_point,
      mode: normalizeTransportMode(segment.transport_mode),
      duration: segment.estimated_duration,
      note: segment.notes || segment.start_time,
    })),
    days: days.map((day) => {
      const dayItems = day.items || [];
      const attractions = dayItems
        .filter((item) => item.item_type === "tour_spot")
        .map((item) => item.title);
      const activities = dayItems
        .filter((item) =>
          ["activity", "free_time", "transfer"].includes(item.item_type),
        )
        .map((item) => item.title);

      return {
        ...day,
        roam_route: day.summary,
        attractions,
        activities,
        items: dayItems.map((item) => {
          const time = formatTime(item.time);
          return [
            time,
            item.title,
            item.estimated_cost
              ? `(${formatMoney(item.estimated_cost, sourceTrip.budget_currency)})`
              : "",
          ]
            .filter(Boolean)
            .join(" ");
        }),
      };
    }),
    notes: [],
    alerts: headsUp.map((alert, index) => ({
      id: `${alert.category || "alert"}-${index}`,
      title: alert.title,
      severity: alert.severity || "medium",
      body: alert.details,
    })),
    chat: buildChatMessages(sourceTrip),
  };
};

const SectionHeader = ({ icon, title, description }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {React.createElement(icon, { size: 18 })}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const TripOverview = ({ trip }) => (
  <section className="rounded-[28px] border border-slate-200 bg-white p-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={trip.status} />
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
            {trip.trip_pace} pace
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">{trip.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{trip.overview}</p>
      </div>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryMetric
        icon={CalendarDays}
        label="Start date"
        value={formatDate(trip.start_date)}
      />
      <SummaryMetric
        icon={Clock3}
        label="Duration"
        value={
          trip.nights
            ? `${trip.nights} nights`
            : `${trip.duration_days || "-"} days`
        }
      />
      <SummaryMetric
        icon={Users}
        label="Travelers"
        value={`${trip.travelers_count || 1} traveler${
          Number(trip.travelers_count || 1) === 1 ? "" : "s"
        }`}
      />
      <SummaryMetric
        icon={DollarSign}
        label="Budget"
        value={formatMoney(trip.total_budget, trip.budget_currency)}
      />
    </div>
    <hr className="my-6" />

    <DestinationSlider destinations={trip.destinations} />
  </section>
);

const DestinationSlider = ({ destinations = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const hasMultipleDestinations = destinations.length > 1;
  const activeDestination = destinations[activeIndex];

  const goToDestination = (nextIndex) => {
    const lastIndex = destinations.length - 1;

    if (nextIndex < 0) {
      setActiveIndex(lastIndex);
      return;
    }

    if (nextIndex > lastIndex) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(nextIndex);
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null || !hasMultipleDestinations) return;

    const touchEnd = event.changedTouches[0].clientX;
    const swipeDistance = touchStart - touchEnd;

    if (Math.abs(swipeDistance) > 40) {
      goToDestination(activeIndex + (swipeDistance > 0 ? 1 : -1));
    }

    setTouchStart(null);
  };

  if (!activeDestination) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Destinations</h2>
          <p className="mt-1 text-sm text-slate-500">
            {destinations.length} destination
            {destinations.length === 1 ? "" : "s"} added to this plan.
          </p>
        </div>

        {hasMultipleDestinations && (
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => goToDestination(activeIndex - 1)}
              aria-label="Previous destination"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => goToDestination(activeIndex + 1)}
              aria-label="Next destination"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      <article
        className="overflow-hidden bg-white rounded-2xl border border-slate-200"
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-56 p-4">
            {activeDestination.image_url ? (
              <img
                src={activeDestination.image_url}
                alt={activeDestination.name}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <div className="center h-full w-full rounded-lg bg-primary/10 text-primary">
                <MapPin size={28} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-5 bg-white p-4 pl-2">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">
                    {activeDestination.name}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin size={15} />
                    {activeDestination.country}
                  </p>
                </div>
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {activeDestination.stay}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {activeDestination.summary}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {hasMultipleDestinations ? (
                <div className="flex justify-center gap-2 sm:justify-start">
                  {destinations.map((destination, index) => (
                    <button
                      key={destination.name}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeIndex
                          ? "w-7 bg-primary"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Show ${destination.name}`}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-xs font-semibold uppercase text-slate-400">
                  Primary destination
                </span>
              )}

              <Button variant="outline" size="sm">
                View details
              </Button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

const SummaryMetric = ({ icon, label, value }) => (
  <div className="rounded-xl border border-slate-200 p-4 flx gap-2">
    <div className="h-8 w-8 center bg-primary/10 rounded-lg">
      {React.createElement(icon, { className: "text-primary", size: 16 })}
    </div>
    <div className="flex-1">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  </div>
);

const PackingSection = ({ items = [] }) => (
  <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
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
  </section>
);

const DocumentsSection = ({ documents = [], uploadedDocuments = [] }) => (
  <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5">
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
  </div>
);

const DayPlanSection = ({ days = [] }) => (
  <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
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

const RouteSection = ({ segments = [] }) => (
  <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
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
  </div>
);

const NotesAlertsSection = ({ notes = [], alerts = [] }) => {
  const [activeNote, setActiveNote] = useState(null);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
        <SectionHeader
          icon={ShieldCheck}
          title="Notes"
          description="Save planning reminders and decisions"
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
        <div className="grid gap-3">
          {notes.length ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50"
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
      </div>

      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
        <SectionHeader
          icon={AlertTriangle}
          title="Alerts"
          description="Important warnings and tasks that need attention."
        />
        <div className="grid gap-3">
          {alerts.length ? (
            alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-xl border border-amber-200 bg-amber-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-amber-950">
                    {alert.title}
                  </h3>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold capitalize text-amber-700">
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-amber-800">{alert.body}</p>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No alerts available yet.
            </p>
          )}
        </div>
      </div>

      <Dialog
        open={!!activeNote}
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
    </section>
  );
};

const AgentChat = ({ messages = [] }) => (
  <aside className="lg:sticky lg:top-24 lg:self-start">
    <div className="flex h-[calc(100vh-7rem)] min-h-[560px] flex-col rounded-[28px] border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareDot size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-950">
              Planning agent
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Continue adjusting route, documents, and daily details.
            </p>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length ? (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto rounded-tr-md bg-primary text-white"
                  : "rounded-tl-md bg-slate-100 text-slate-700"
              }`}
            >
              {message.content}
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
            No agent messages available yet.
          </p>
        )}
      </div>

      <form className="border-t border-slate-200 p-4">
        <Textarea
          placeholder="Ask to adjust dates, route, documents, or packing..."
          className="min-h-24 resize-none rounded-xl border-slate-200 bg-slate-50 text-sm"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm">
            <Plus size={15} />
            Add context
          </Button>
          <Button type="submit" size="sm">
            <Send size={15} />
            Send
          </Button>
        </div>
      </form>
    </div>
  </aside>
);

const planningTabs = [
  { value: "packing", label: "Packing" },
  { value: "documents", label: "Documents" },
  { value: "route", label: "Route plan" },
  { value: "days", label: "Day wise plan" },
];

const PlanningTabs = ({ trip }) => {
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
    </section>
  );
};

const TripDetailPage = () => {
  const { trip_id } = useParams();

  const { data, isFetching, isError } = useTripDetailQuery(trip_id);
  const trip = useMemo(
    () => normalizeTripDetail(unwrapTripDetail(data)),
    [data],
  );

  if (isFetching) {
    return (
      <div className="center min-h-[420px] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading trip details...
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <section className="py-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-950">
            Trip details unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Could not load this trip from the API.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 py-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-5">
        <TripOverview trip={trip} />
        <PlanningTabs trip={trip} />
        <NotesAlertsSection notes={trip.notes} alerts={trip.alerts} />
      </div>

      <AgentChat messages={trip.chat} />
    </section>
  );
};

export default TripDetailPage;
