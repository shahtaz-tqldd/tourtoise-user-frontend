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
import { Textarea } from "@/components/ui/textarea";
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
import React, { useState } from "react";

const demoTrip = {
  title: "Amalfi Coast trip plan",
  status: "draft",
  overview:
    "A balanced three-day coastal trip with scenic transfers, compact town walks, ferry views, and flexible evening windows for restaurants and rest.",
  start_date: "2026-05-27",
  end_date: "2026-05-29",
  nights: 2,
  travelers_count: 1,
  trip_pace: "balanced",
  total_budget: 200,
  budget_currency: "USD",
  destinations: [
    {
      name: "Sorrento",
      country: "Italy",
      stay: "Arrival base",
      image_url:
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
      summary:
        "Convenient starting point for the coast with easy rail, ferry, and road access.",
    },
    {
      name: "Positano",
      country: "Italy",
      stay: "Day visit",
      image_url:
        "https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=900&q=80",
      summary:
        "Cliffside village for viewpoints, beach time, boutiques, and a slow lunch.",
    },
    {
      name: "Amalfi",
      country: "Italy",
      stay: "Final coastal stop",
      image_url:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
      summary:
        "Historic town center, cathedral area, waterfront walks, and ferry return options.",
    },
  ],
  packing_items: [
    { label: "Passport and travel wallet", packed: true },
    { label: "Comfortable walking shoes", packed: false },
    { label: "Light rain jacket", packed: false },
    { label: "Power bank and Type C charger", packed: true },
    { label: "Sunscreen and sunglasses", packed: false },
  ],
  documents: [
    { name: "Passport", status: "ready", note: "Valid through 2030" },
    {
      name: "Hotel confirmation",
      status: "missing",
      note: "Upload after booking",
    },
    { name: "Travel insurance", status: "review", note: "Check coverage area" },
    {
      name: "Ferry tickets",
      status: "missing",
      note: "Book once route is locked",
    },
  ],
  uploaded_documents: [
    {
      name: "passport-scan.pdf",
      type: "Identity",
      uploaded_at: "May 20, 2026",
      status: "verified",
    },
    {
      name: "naples-arrival-ticket.pdf",
      type: "Ticket",
      uploaded_at: "May 22, 2026",
      status: "needs review",
    },
  ],
  days: [
    {
      day: 1,
      date: "2026-05-27",
      title: "Arrive in Naples and settle in Sorrento",
      roam_route:
        "Naples Airport -> Sorrento Hotel -> Marina Grande -> Piazza Tasso",
      attractions: [
        "Marina Grande",
        "Piazza Tasso",
        "Villa Comunale viewpoint",
      ],
      activities: [
        "Airport pickup",
        "Hotel check-in",
        "Sunset waterfront walk",
      ],
      items: [
        "Land in Naples and collect luggage",
        "Private car transfer to Sorrento",
        "Hotel check-in and waterfront walk",
        "Dinner near Piazza Tasso",
      ],
    },
    {
      day: 2,
      date: "2026-05-28",
      title: "Positano viewpoints and beach time",
      roam_route:
        "Sorrento Port -> Positano Ferry Dock -> Spiaggia Grande -> Viewpoint walk",
      attractions: [
        "Spiaggia Grande",
        "Via Cristoforo Colombo",
        "Fornillo Beach",
      ],
      activities: ["Morning ferry", "Slow lunch", "Photo walk", "Beach break"],
      items: [
        "Morning ferry from Sorrento to Positano",
        "Walk Via Cristoforo Colombo viewpoints",
        "Lunch reservation near Spiaggia Grande",
        "Return before late evening crowds",
      ],
    },
    {
      day: 3,
      date: "2026-05-29",
      title: "Amalfi town and return",
      roam_route: "Positano -> Amalfi Cathedral -> Amalfi waterfront -> Naples",
      attractions: ["Amalfi Cathedral", "Piazza Duomo", "Amalfi waterfront"],
      activities: [
        "Ferry transfer",
        "Cathedral visit",
        "Coffee stop",
        "Return transfer",
      ],
      items: [
        "Transfer to Amalfi by ferry",
        "Visit Amalfi Cathedral area",
        "Coffee and souvenir window",
        "Return to Naples for onward travel",
      ],
    },
  ],
  route_segments: [
    {
      from: "Naples Airport",
      to: "Sorrento Hotel",
      mode: "car",
      duration: "1h 25m",
      note: "Private transfer after arrival",
    },
    {
      from: "Sorrento Port",
      to: "Positano",
      mode: "ferry",
      duration: "45m",
      note: "Best views on the right side outbound",
    },
    {
      from: "Positano",
      to: "Amalfi",
      mode: "ferry",
      duration: "25m",
      note: "Keep buffer for boarding queues",
    },
    {
      from: "Amalfi",
      to: "Naples",
      mode: "bus",
      duration: "2h 10m",
      note: "Fallback if ferry timing does not match",
    },
  ],
  notes: [
    {
      id: 1,
      title: "Ferry buffer",
      body: "Keep at least 30 minutes between ferry arrival and restaurant booking.",
      created_at: "May 22, 2026",
    },
    {
      id: 2,
      title: "Luggage caution",
      body: "Avoid carrying large luggage into Positano during the day visit.",
      created_at: "May 23, 2026",
    },
    {
      id: 3,
      title: "Weather check",
      body: "Confirm sea conditions the evening before ferry-heavy days.",
      created_at: "May 24, 2026",
    },
  ],
  alerts: [
    {
      id: 1,
      title: "Ferry schedules change in rough weather",
      severity: "medium",
      body: "Check ferry status the night before Day 2 and Day 3.",
    },
    {
      id: 2,
      title: "Restaurant booking needed",
      severity: "low",
      body: "Reserve lunch near Spiaggia Grande before the route is locked.",
    },
  ],
  chat: [
    {
      role: "agent",
      content:
        "I drafted this as a balanced pace plan with Sorrento as the base. The biggest open decision is whether to prioritize ferry views or road flexibility.",
    },
    {
      role: "user",
      content: "Keep ferry where possible, but avoid risky late returns.",
    },
    {
      role: "agent",
      content:
        "Noted. I kept ferries for scenic daytime movement and added bus or car fallbacks for the return legs.",
    },
  ],
};

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
        value={`${trip.nights} nights`}
      />
      <SummaryMetric
        icon={Users}
        label="Travelers"
        value={`${trip.travelers_count} traveler`}
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

const DestinationSlider = ({ destinations }) => {
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
            <img
              src={activeDestination.image_url}
              alt={activeDestination.name}
              className="h-full w-full object-cover rounded-lg"
            />
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

const PackingSection = ({ items }) => (
  <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
    <SectionHeader
      icon={Backpack}
      title="Packing"
      description="Track essentials before the trip is locked."
    />
    <div className="grid gap-2">
      {items.map((item) => (
        <label
          key={item.label}
          className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700"
        >
          <Checkbox defaultChecked={item.packed} />
          {item.label}
        </label>
      ))}
    </div>
  </section>
);

const DocumentsSection = ({ documents, uploadedDocuments }) => (
  <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5">
    <SectionHeader
      icon={FileCheck2}
      title="Documents"
      description="Manage required documents and personal uploads from one place."
    />

    <div className="grid gap-3 md:grid-cols-2">
      {documents.map((document) => (
        <article
          key={document.name}
          className="rounded-lg border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">{document.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{document.note}</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
              {document.status}
            </span>
          </div>
        </article>
      ))}
    </div>

    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">Uploaded files</h3>
        <Button variant="outline" size="sm">
          <Upload size={15} />
          Upload
        </Button>
      </div>
      {uploadedDocuments.map((document) => (
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
      ))}
    </div>
  </div>
);

const DayPlanSection = ({ days }) => (
  <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
    <SectionHeader
      icon={CalendarDays}
      title="Day wise plan"
      description="A readable daily structure that the agent can continue refining."
    />
    <DayAccordion days={days} />
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

const DetailList = ({ title, items }) => (
  <div className="rounded-lg border border-slate-200 p-3">
    <p className="text-sm font-semibold text-slate-950">{title}</p>
    <div className="mt-3 grid gap-2">
      {items.map((item) => (
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
);

const RouteSection = ({ segments }) => (
  <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
    <SectionHeader
      icon={Route}
      title="Route"
      description="Visual movement plan showing origin, destination, vehicle, and timing."
    />
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="relative space-y-4">
        {segments.map((segment, index) => {
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
        })}
      </div>
    </div>
  </div>
);

const NotesAlertsSection = ({ notes, alerts }) => {
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
          {notes.map((note) => (
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
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
        <SectionHeader
          icon={AlertTriangle}
          title="Alerts"
          description="Important warnings and tasks that need attention."
        />
        <div className="grid gap-3">
          {alerts.map((alert) => (
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
          ))}
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

const AgentChat = ({ messages }) => (
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
        {messages.map((message, index) => (
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
        ))}
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
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        {planningTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
  const trip = demoTrip;

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
