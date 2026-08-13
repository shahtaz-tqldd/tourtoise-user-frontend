import React from "react";
import {
  ArrowRight,
  Backpack,
  BellRing,
  BookOpenText,
  Bot,
  CalendarDays,
  Check,
  ChefHat,
  Coins,
  Compass,
  FileCheck2,
  MapPinned,
  MessageCircle,
  Route,
  Sparkles,
  Utensils,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import useTitle from "@/hooks/useTitle";
import { Container } from "@/components/ui/container";

const planningFeatures = [
  { label: "Recommended spots", icon: MapPinned },
  { label: "Activities & cuisine", icon: Utensils },
  { label: "Daily itinerary", icon: CalendarDays },
  { label: "Packing checklist", icon: Backpack },
  { label: "Travel documents", icon: FileCheck2 },
  { label: "Routes & transport", icon: Route },
  { label: "Budget estimate", icon: WalletCards },
  { label: "Important heads-ups", icon: BellRing },
];

const journeySteps = [
  {
    number: "01",
    label: "Discover",
    title: "Find a destination that feels right",
    description:
      "Start with inspiration or ask Turtle for recommendations based on the kind of experience you want. Every destination brings the useful details together, so comparing possibilities feels simple.",
  },
  {
    number: "02",
    label: "Plan",
    title: "Turn your choice into an organized trip",
    description:
      "Once you pick a destination, Tourtoise shapes a practical plan around your dates and tourist preferences—from recommended places to a day-by-day itinerary.",
  },
  {
    number: "03",
    label: "Travel",
    title: "Get timely guidance throughout the journey",
    description:
      "Prepare with confidence before departure, then keep each day on track with itinerary guidance, useful alerts, and a trip-aware assistant whenever questions come up.",
  },
];

const AppFeaturesPage = () => {
  useTitle("Tourtoise Features");

  return (
    <Container className="pb-0 md:pb-5" childClassName="md:px-6">
      <Cover />

      <div className="mt-8 lg:mt-16 space-y-12 lg:space-y-24">
        <JourneySection
          id="discover"
          step={journeySteps[0]}
          icon={Compass}
          action={{ label: "Explore destinations", to: "/" }}
        >
          <DiscoveryVisual />
        </JourneySection>

        <JourneySection
          id="plan"
          step={journeySteps[1]}
          icon={CalendarDays}
          action={{ label: "View your trips", to: "/trips" }}
          reverse
        >
          <PlanningVisual />
        </JourneySection>

        <JourneySection
          id="travel"
          step={journeySteps[2]}
          icon={Route}
          action={{ label: "Open trip workspace", to: "/trips" }}
        >
          <GuidanceVisual />
        </JourneySection>
      </div>

      <BeyondTheTrip />
    </Container>
  );
};

const JourneySection = ({
  id,
  step,
  icon,
  action,
  reverse = false,
  children,
}) => (
  <article
    id={id}
    className="scroll-mt-28 grid items-center gap-9 lg:grid-cols-2 lg:gap-16"
  >
    <div className={reverse ? "lg:order-2" : ""}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {React.createElement(icon, {
            className: "size-5",
            "aria-hidden": true,
          })}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {step.number} · {step.label}
        </span>
      </div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
        {step.title}
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
        {step.description}
      </p>
      <Link
        to={action.to}
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        {action.label}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>

    <div className={reverse ? "lg:order-1" : ""}>{children}</div>
  </article>
);

const DiscoveryVisual = () => (
  <div className="relative overflow-hidden md:rounded-3xl -mx-2.5 md:mx-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 sm:p-7">
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Bot className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Ask Turtle
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          “Where should I go for culture, food, and a relaxed pace?”
        </p>
      </div>
    </div>

    <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-lg shadow-emerald-900/5">
      <div className="relative h-32 bg-gradient-to-r from-emerald-700 to-teal-500 p-5 text-white sm:h-36">
        <span className="text-xs font-semibold text-emerald-100">
          Recommended for you
        </span>
        <h3 className="mt-1 text-2xl font-bold">Your next destination</h3>
        <p className="mt-1 text-xs text-emerald-50">
          Culture · Food · Easy-going days
        </p>
        <MapPinned
          className="absolute bottom-4 right-5 size-14 text-white/15"
          aria-hidden="true"
        />
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 p-4">
        {[
          { label: "Attractions", detail: "Places to explore", icon: Compass },
          { label: "Activities", detail: "Things to enjoy", icon: Sparkles },
          { label: "Cuisine", detail: "Flavors to taste", icon: ChefHat },
        ].map((item) => (
          <div key={item.label} className="min-w-0 px-2 text-center sm:px-3">
            {React.createElement(item.icon, {
              className: "mx-auto size-4 text-primary",
              "aria-hidden": true,
            })}
            <p className="mt-2 text-xs font-bold text-slate-800">
              {item.label}
            </p>
            <p className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PlanningVisual = () => (
  <div className="overflow-hidden md:rounded-3xl -mx-2.5 md:mx-0 bg-gradient-to-br from-blue-100/60 via-amber-50/30 to-emerald-100/60 p-5 sm:p-7">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-primary">
          Your personalized plan
        </p>
        <h3 className="mt-1 text-lg font-bold">Everything, organized</h3>
      </div>
      <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-primary">
        Built around you
      </span>
    </div>

    <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4">
      {planningFeatures.map((feature) => (
        <div key={feature.label} className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary">
            {React.createElement(feature.icon, {
              className: "size-3.5",
              "aria-hidden": true,
            })}
          </span>
          <span className="text-xs font-medium text-slate-600 sm:text-sm">
            {feature.label}
          </span>
        </div>
      ))}
    </div>

    <div className="mt-7 rounded-2xl bg-white p-4 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Day 2
          </p>
          <p className="mt-0.5 text-sm font-bold">Culture and local flavors</p>
        </div>
        <CalendarDays className="size-5 text-slate-300" aria-hidden="true" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        {[
          ["09:00", "Historic district"],
          ["13:00", "Local lunch"],
          ["16:00", "Riverside walk"],
        ].map(([time, activity], index) => (
          <React.Fragment key={time}>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-primary">{time}</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-500">
                {activity}
              </p>
            </div>
            {index < 2 ? (
              <span className="h-px w-3 shrink-0 bg-slate-200" />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

const GuidanceVisual = () => (
  <div className="relative mx-auto max-w-lg px-2 py-3 sm:px-6">
    <div
      className="absolute bottom-14 md:bottom-8 left-3 md:left-[30px] top-8 w-px bg-gradient-to-b from-amber-300 via-primary to-sky-300 sm:left-12"
      aria-hidden="true"
    />
    <div className="relative space-y-4">
      {[
        {
          label: "Before your trip",
          title: "You still need to upload your travel insurance",
          icon: FileCheck2,
          tone: "bg-amber-50 text-amber-700",
        },
        {
          label: "Today · Day 3",
          title: "Your museum visit starts at 10:00 AM",
          icon: CalendarDays,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Trip chat",
          title: "Ask anything about your plan while you travel",
          icon: MessageCircle,
          tone: "bg-sky-50 text-sky-700",
        },
      ].map((item) => (
        <div
          key={item.label}
          className="relative ml-10 flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-md shadow-slate-200/40 sm:ml-12"
        >
          <span
            className={`absolute -left-[52px] flex size-8 items-center justify-center rounded-full ring-4 ring-white sm:-left-[58px] ${item.tone}`}
          >
            {React.createElement(item.icon, {
              className: "size-3.5",
              "aria-hidden": true,
            })}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
              {item.title}
            </p>
          </div>
          <Check
            className="mt-1 size-4 shrink-0 text-slate-300"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  </div>
);

const BeyondTheTrip = () => (
  <section className="mt-20 overflow-hidden md:rounded-3xl -mx-2.5 md:mx-0 bg-primary/5 lg:mt-28">
    <div className="grid lg:grid-cols-2">
      <div className="p-6 sm:p-9 lg:p-12">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-primary">
          <BookOpenText className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Remember & inspire
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          Turn your journey into a <span className="text-primary">journal</span>
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Capture your experiences, share the story with other travelers, and
          discover journals that can inspire a future trip.
        </p>
        <Link
          to="/travel-journal"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          Explore travel journals
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative bg-primary p-6 text-white sm:p-9 lg:p-12">
        <Coins
          className="absolute right-8 top-8 size-20 text-white/10"
          aria-hidden="true"
        />
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 text-amber-200">
          <Coins className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
          Simple credit system
        </p>
        <h2 className="mt-2 text-2xl font-bold">
          Start free, recharge monthly
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/80">
          Every account begins with 100 free credits. You receive 20 more
          credits each month, up to a maximum free-credit balance of 100.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">
            100 initial credits
          </span>
          <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">
            +20 every month
          </span>
        </div>
      </div>
    </div>
  </section>
);

const Cover = () => {
  return (
    <div
      style={{
        backgroundImage: 'url("/about_cover.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative isolate overflow-hidden -mx-2.5 md:mx-0 -mt-5 md:mt-0 md:rounded-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20"
    >
      {/* White readability gradient */}
      <div
        className="absolute inset-0 md:right-1/3 bg-gradient-to-r from-white/95 via-white/80 to-transparent"
        aria-hidden="true"
      />

      {/* Extra soft wash around text */}
      <div
        className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-white/50 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-2 py-1.5 text-sm font-semibold text-emerald-700">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Welcome to tourtoise
        </span>

        <h1 className="mt-5 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.2]">
          Your smart <span className="text-primary">travel</span> companion
        </h1>

        <p className="mt-6 max-w-[220px] md:max-w-xl text-sm leading-6 md:leading-8 text-slate-700 sm:text-lg">
          tourtoise is an AI-powered travel companion that helps you discover
          destinations, plan personalized trips, and stay guided throughout your
          journey.
        </p>
        <nav className="mt-12 flex gap-8" aria-label="Tourtoise journey">
          {journeySteps.map((step) => (
            <a
              key={step.number}
              href={`#${step.label.toLowerCase()}`}
              className="group flex min-w-0 items-center justify-center gap-2 sm:gap-3"
            >
              <span className="hidden text-xs font-black text-primary/40 sm:block">
                {step.number}
              </span>
              <span className="text-xs font-bold text-slate-700 transition group-hover:text-primary sm:text-sm">
                {step.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AppFeaturesPage;
