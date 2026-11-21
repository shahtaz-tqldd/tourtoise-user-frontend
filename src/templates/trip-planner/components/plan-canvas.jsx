import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Backpack,
  CalendarDays,
  Car,
  Check,
  Clock,
  Footprints,
  Heart,
  ListChecks,
  PartyPopper,
  Star,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { KIND_KEYS, KIND_META, formatDay } from "../planner-engine";
import FactCard from "./fact-card";
import { ItemVisual, KIND_ICON, SectionTitle } from "./planner-ui";

const TASK_SECTION = { recommend: "discover", itinerary: "itinerary", budget: "budget", packing: "pack" };

/* ------------------------------------------------------------ helpers -- */

const CanvasSection = ({ id, active, children, className }) => (
  <section
    id={`canvas-${id}`}
    className={cn(
      "pl-rise scroll-mt-4 rounded-card bg-surface p-4 ring-1 transition-shadow md:p-5",
      active ? "ring-brand-300 shadow-raised" : "ring-line-subtle",
      className,
    )}
  >
    {children}
  </section>
);

/** Dashed placeholder for a section Turtle hasn't written yet. */
const Upcoming = ({ icon: Icon, title, note }) => (
  <div className="flex items-center gap-3 rounded-card border border-dashed border-line-strong px-4 py-3.5">
    <span className="center size-8 shrink-0 rounded-full bg-surface-muted text-faint">
      <Icon className="size-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-body-sm font-semibold text-subtle">{title}</p>
      <p className="text-caption text-faint">{note}</p>
    </div>
  </div>
);

const Writing = ({ facts, destinationName, rows = 3, children }) => (
  <div className="mt-4 space-y-3">
    {children}
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="pl-shimmer h-11 rounded-control" style={{ opacity: 1 - i * 0.22 }} />
      ))}
    </div>
    <FactCard facts={facts} destinationName={destinationName} />
  </div>
);

/* ---------------------------------------------------------- blueprint -- */

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <dt className="text-caption text-subtle">{label}</dt>
    <dd key={value} className="pl-drop truncate text-right text-body-sm font-semibold text-heading">
      {value}
    </dd>
  </div>
);

const Blueprint = ({ p, active }) => {
  const { trip, tripLabels, money } = p;
  return (
    <CanvasSection id="setup" active={active}>
      <SectionTitle icon={CalendarDays} meta={active ? "Fills in as you choose →" : null}>
        Trip basics
      </SectionTitle>
      <div className="mt-2 grid gap-x-6 md:grid-cols-2">
        <dl className="divide-y divide-line-subtle">
          <Row label="When" value={`${tripLabels.dateLabel} · ${trip.nights + 1} days`} />
          <Row label="Who" value={`${tripLabels.typeLabel} · ${trip.travelers} ${trip.travelers > 1 ? "people" : "person"}`} />
          <Row label="Pace" value={tripLabels.paceLabel} />
        </dl>
        <dl className="divide-y divide-line-subtle">
          <Row label="Stay" value={tripLabels.stayLabel} />
          <Row label="Budget" value={`${money(trip.budgetPerPerson)} / person`} />
          <div className="py-2">
            <dt className="sr-only">Interests</dt>
            <dd className="flex flex-wrap gap-1">
              {trip.interests.length ? (
                trip.interests.map((i) => (
                  <span key={i} className="pl-drop rounded-full bg-accent px-2 py-0.5 text-2xs font-semibold text-brand-text">
                    {i}
                  </span>
                ))
              ) : (
                <span className="text-caption italic text-faint">No interests yet</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </CanvasSection>
  );
};

/* -------------------------------------------------------------- picks -- */

const PicksSection = ({ p, active, writing, facts, destinationName }) => {
  const groups = KIND_KEYS.map((k) => ({ k, items: p.picks.filter((i) => i.kind === k) }));

  return (
    <CanvasSection id="discover" active={active}>
      <SectionTitle icon={Heart} meta={writing ? "Shortlisting…" : `${p.picks.length} picked`}>
        Your picks
      </SectionTitle>
      {writing ? (
        <Writing facts={facts} destinationName={destinationName} rows={2}>
          <ul className="flex flex-wrap gap-1.5">
            {p.task.found.map((item) => (
              <li key={item.id} className="pl-drop flex items-center gap-1.5 rounded-full bg-surface-subtle py-0.5 pl-0.5 pr-2.5 ring-1 ring-line-subtle">
                <ItemVisual item={item} className="size-6 rounded-full" />
                <span className="text-caption font-medium text-body">{item.name}</span>
              </li>
            ))}
          </ul>
        </Writing>
      ) : p.picks.length === 0 ? (
        <p className="mt-3 rounded-control border border-dashed border-line-strong px-4 py-5 text-center text-body-sm text-faint">
          Nothing picked yet — choose from the list on the right and it lands here.
        </p>
      ) : (
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {groups.map(({ k, items }) => {
            const Icon = KIND_ICON[k];
            return (
              <div key={k}>
                <p className="flex items-center gap-1.5 text-caption font-semibold text-subtle">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {KIND_META[k].label} · {items.length}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {items.map((item) => (
                    <li key={item.id} className="pl-drop flex items-center gap-2.5 rounded-control bg-surface-subtle p-1.5 ring-1 ring-line-subtle">
                      <ItemVisual item={item} className="size-10 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 truncate text-caption font-bold text-heading">
                          {item.love && <Star className="size-3 shrink-0 fill-sand-400 text-sand-400" aria-label="Must-do" />}
                          <span className="truncate">{item.name}</span>
                        </p>
                        <p className="truncate text-2xs text-subtle">{item.area}</p>
                      </div>
                    </li>
                  ))}
                  {!items.length && <li className="text-caption italic text-faint">None yet</li>}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </CanvasSection>
  );
};

/* ---------------------------------------------------------- itinerary -- */

const Transfer = ({ from, to }) => {
  const same = from.area === to.area;
  const Icon = same ? Footprints : Car;
  const mins = same ? 5 + ((from.name.length + to.name.length) % 8) : 12 + ((from.name.length * to.name.length) % 25);
  return (
    <p className="flex items-center gap-1.5 py-1 pl-[4.25rem] text-2xs text-faint">
      <Icon className="size-3" aria-hidden="true" />
      {same ? `${mins} min walk` : `~${mins} min ride to ${to.area}`}
    </p>
  );
};

const ItinerarySection = ({ p, active, writing, facts, destinationName }) => (
  <CanvasSection id="itinerary" active={active}>
    <SectionTitle icon={CalendarDays} meta={writing ? "Sequencing days…" : `${p.plan?.days.length || 0} days · ${p.tripLabels.paceLabel} pace`}>
      Day by day
    </SectionTitle>
    {writing || !p.plan ? (
      <Writing facts={facts} destinationName={destinationName} rows={3} />
    ) : (
      <div className="mt-3 space-y-3">
        {p.plan.days.map((day, di) => {
          const hours = day.items.reduce((s, i) => s + i.durationHrs, 0);
          return (
            <article
              key={day.index}
              className="pl-rise rounded-control bg-surface-subtle ring-1 ring-line-subtle"
              style={{ animationDelay: `${di * 110}ms` }}
            >
              <header className="flex items-center gap-3 border-b border-line-subtle px-3 py-2">
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-2xs font-bold text-white">Day {day.index + 1}</span>
                <p className="min-w-0 flex-1 truncate text-body-sm font-bold text-heading">{day.title}</p>
                <span className="shrink-0 text-2xs text-subtle">
                  {formatDay(day.date)} · {hours}h
                </span>
              </header>
              {day.items.length ? (
                <ol className="p-2">
                  {day.items.map((item, i) => (
                    <li key={item.id}>
                      {i > 0 && <Transfer from={day.items[i - 1]} to={item} />}
                      <div className="pl-drop flex items-center gap-2.5" style={{ animationDelay: `${di * 110 + 150 + i * 70}ms` }}>
                        <span className="w-14 shrink-0 text-right text-2xs font-bold text-heading">{item.time}</span>
                        <ItemVisual item={item} className="size-8 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 truncate text-caption font-semibold text-heading">
                            {item.love && <Star className="size-3 shrink-0 fill-sand-400 text-sand-400" aria-label="Must-do" />}
                            <span className="truncate">{item.name}</span>
                          </p>
                          <p className="truncate text-2xs text-subtle">
                            {item.area}
                            {item.note ? ` · ${item.note}` : ""}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="px-3 py-2.5 text-caption italic text-faint">Free day — wander, rest, or ask Turtle to add something.</p>
              )}
            </article>
          );
        })}
        {p.plan.unplaced.length > 0 && (
          <p className="rounded-control bg-warning-soft px-3 py-2 text-caption text-warning">
            {p.plan.unplaced.length} pick{p.plan.unplaced.length > 1 ? "s" : ""} didn't fit — sort them out on the right.
          </p>
        )}
      </div>
    )}
  </CanvasSection>
);

/* ------------------------------------------------------------- budget -- */

const BudgetSection = ({ p, active, writing, facts, destinationName }) => {
  const b = p.budget;
  return (
    <CanvasSection id="budget" active={active}>
      <SectionTitle icon={Wallet} meta={writing || !b ? "Pricing…" : `${p.money(b.total)} total`}>
        Budget
      </SectionTitle>
      {writing || !b ? (
        <Writing facts={facts} destinationName={destinationName} rows={4} />
      ) : (
        <div className="mt-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-h3 font-bold text-heading">
              {p.money(b.perPerson)}
              <span className="ml-1.5 text-caption font-medium text-subtle">per person</span>
            </p>
            <span
              key={String(b.perPerson <= p.trip.budgetPerPerson)}
              className={cn(
                "pl-pop rounded-full px-2.5 py-1 text-caption font-semibold",
                b.perPerson <= p.trip.budgetPerPerson ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
              )}
            >
              {b.perPerson <= p.trip.budgetPerPerson
                ? `Within budget · ${p.money(p.trip.budgetPerPerson - b.perPerson)} spare`
                : `${p.money(b.perPerson - p.trip.budgetPerPerson)} over budget`}
            </span>
          </div>

          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-surface-muted">
            {b.lines.map((l, i) => (
              <div
                key={l.key}
                className={cn("pl-grow h-full transition-[width] duration-700", l.color)}
                style={{ width: `${(l.amount / b.total) * 100}%`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
          <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
            {b.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-2.5 border-b border-line-subtle py-2">
                <span className={cn("size-2.5 shrink-0 rounded-full", l.color)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-semibold text-heading">{l.label}</p>
                  <p className="truncate text-2xs text-subtle">{l.detail}</p>
                </div>
                <p className="text-caption font-bold text-heading">{p.money(l.amount)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-2xs text-faint">
            {p.money(b.total)} for {p.trip.travelers} · {p.money(b.perDay)} per day · excludes flights to Nepal
          </p>
        </div>
      )}
    </CanvasSection>
  );
};

/* ---------------------------------------------------------------- bag -- */

const BagSection = ({ p, active, writing, facts, destinationName }) => {
  const all = p.packing?.flatMap((g) => g.items) || [];
  const done = all.filter((i) => p.checked.has(i.id)).length;
  return (
    <CanvasSection id="pack" active={active}>
      <SectionTitle icon={Backpack} meta={writing || !p.packing ? "Writing list…" : `${done}/${all.length} packed`}>
        Bag & documents
      </SectionTitle>
      {writing || !p.packing ? (
        <Writing facts={facts} destinationName={destinationName} rows={3} />
      ) : (
        <>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${(done / all.length) * 100}%` }} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {p.packing.map((g) => (
              <div key={g.group}>
                <p className="text-caption font-semibold text-subtle">{g.group}</p>
                <ul className="mt-1.5 flex flex-wrap gap-1">
                  {g.items.map((i) => {
                    const on = p.checked.has(i.id);
                    return (
                      <li
                        key={i.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium ring-1 transition",
                          on ? "bg-success-soft text-success ring-transparent" : "bg-surface text-body ring-line-subtle",
                        )}
                      >
                        {on && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                        {i.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </CanvasSection>
  );
};

/* ------------------------------------------------------------- canvas -- */

/** Left side: the plan as Turtle writes it. Read-only — controls live on the right. */
const PlanCanvas = ({ p, destination, facts, backHref }) => {
  const writingSection = p.task ? TASK_SECTION[p.task.kind] : null;
  const shown = Math.max(p.furthest, writingSection ? ["setup", "discover", "itinerary", "budget", "pack"].indexOf(writingSection) : 0);
  const focus = writingSection || p.stage;

  useEffect(() => {
    const el = document.getElementById(`canvas-${focus}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus]);

  const common = { p, facts, destinationName: destination.name };

  return (
    <div className="flex flex-col gap-3 p-3 md:p-4">
      <header className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={backHref}
            aria-label={`Back to ${destination.name}`}
            className="hidden size-8 shrink-0 items-center justify-center rounded-full text-subtle ring-1 ring-line-subtle transition hover:bg-surface hover:text-heading lg:inline-flex"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-body-lg font-bold text-heading">Trip to {destination.name}</h1>
            <p className="text-caption text-subtle">Live plan — updates as you decide</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-2xs font-semibold text-subtle ring-1 ring-line-subtle">
          <span className={cn("size-1.5 rounded-full", p.task || p.chatBusy ? "animate-pulse bg-brand-500" : "bg-line-strong")} />
          {p.task || p.chatBusy ? "Turtle is writing" : p.completed ? "Saved" : "Draft"}
        </span>
      </header>

      {p.completed && (
        <section className="pl-pop flex items-center gap-3 rounded-card bg-accent p-4 ring-1 ring-brand-200">
          <span className="center size-10 shrink-0 rounded-full bg-surface text-brand-600">
            <PartyPopper className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-body-sm font-bold text-heading">{destination.name} is planned and saved</p>
            <p className="text-caption text-subtle">Turtle will watch the weather and guide you day by day once you're there.</p>
          </div>
        </section>
      )}

      <Blueprint p={p} active={focus === "setup"} />

      {shown >= 1 ? (
        <PicksSection {...common} active={focus === "discover"} writing={writingSection === "discover"} />
      ) : (
        <Upcoming icon={Heart} title="Your picks" note="Spots, activities and food matched to you" />
      )}
      {shown >= 2 ? (
        <ItinerarySection {...common} active={focus === "itinerary"} writing={writingSection === "itinerary"} />
      ) : (
        <Upcoming icon={Clock} title="Day by day" note="Turtle sequences your picks into days" />
      )}
      {shown >= 3 ? (
        <BudgetSection {...common} active={focus === "budget"} writing={writingSection === "budget"} />
      ) : (
        <Upcoming icon={Wallet} title="Budget" note="A full breakdown, trimmed to fit" />
      )}
      {shown >= 4 ? (
        <BagSection {...common} active={focus === "pack"} writing={writingSection === "pack"} />
      ) : (
        <Upcoming icon={ListChecks} title="Bag & documents" note="What to pack for this exact trip" />
      )}
    </div>
  );
};

export default PlanCanvas;
