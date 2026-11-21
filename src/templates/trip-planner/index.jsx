"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, ListTodo, SlidersHorizontal } from "lucide-react";

import { useDestinationDetailQuery } from "@/features/destination/destinationApiSlice";
import useMobileBottomNavbar from "@/hooks/useMobileBottomNavbar";
import useTitle from "@/hooks/useTitle";
import { cn } from "@/lib/utils";

import AgentVeil from "./components/agent-veil";
import ControlPanel from "./components/control-panel";
import BudgetControls from "./components/controls/budget-controls";
import DiscoverControls from "./components/controls/discover-controls";
import ItineraryControls from "./components/controls/itinerary-controls";
import PackControls from "./components/controls/pack-controls";
import SetupControls from "./components/controls/setup-controls";
import PlanCanvas from "./components/plan-canvas";
import { EMPTY_PROFILE } from "./mock/mock-data";
import { getFacts } from "./planner-engine";
import usePlanner, { STAGES } from "./use-planner";

/** Used if the destination API is unreachable, so the demo always runs. */
const DEMO_DESTINATION = {
  name: "Pokhara",
  slug: "pokhara",
  country: "Nepal",
  address: "Gandaki Province",
  currency: "NPR",
  local_languages: ["Nepali", "English"],
  best_travel_months: [9, 10, 11, 2, 3],
  min_stay_days: 3,
  max_stay_days: 5,
};

/* The app header is 64px (72px from md) plus a 1px border. */
const SCREEN = "h-[calc(100dvh-65px)] md:h-[calc(100dvh-73px)]";

const Planner = ({ destination }) => {
  const searchParams = useSearchParams();
  const user = useSelector((state) => state.auth.user);
  // `?first=1` previews the first-time flow (no saved travel profile).
  const forceFirstTime = searchParams.get("first") === "1";
  const profile = useMemo(
    () =>
      forceFirstTime
        ? { ...EMPTY_PROFILE, preferred_currency: user?.preferred_currency, loaded: true }
        : { ...EMPTY_PROFILE, ...(user || {}), loaded: Boolean(user) },
    [user, forceFirstTime],
  );

  const p = usePlanner({ destination, profile });
  const facts = useMemo(() => getFacts(destination), [destination]);
  const [mobilePane, setMobilePane] = useState("controls");

  useMobileBottomNavbar({ hidden: true });
  useTitle(`Plan ${destination.name} · tourtoise`);

  const controls = () => {
    if (p.task) return <AgentVeil task={p.task} onSkip={p.skipTask} />;
    switch (p.stage) {
      case "setup":
        return (
          <SetupControls
            destination={destination}
            trip={p.trip}
            updateTrip={p.updateTrip}
            profile={profile}
            money={p.money}
            onNext={p.startDiscover}
          />
        );
      case "discover":
        return (
          <DiscoverControls
            ranked={p.ranked}
            decisions={p.decisions}
            decide={p.decide}
            autoPick={p.autoPick}
            picks={p.picks}
            money={p.money}
            onNext={p.startItinerary}
          />
        );
      case "itinerary":
        return (
          <ItineraryControls
            plan={p.plan}
            trip={p.trip}
            replan={p.replan}
            moveItem={p.moveItem}
            removeItem={p.removeItem}
            onNext={p.startBudget}
          />
        );
      case "budget":
        return (
          <BudgetControls
            budget={p.budget}
            plan={p.plan}
            trip={p.trip}
            updateTrip={p.updateTrip}
            money={p.money}
            removeItem={p.removeItem}
            onAsk={p.ask}
            chatBusy={p.chatBusy}
            onNext={p.startPacking}
          />
        );
      case "pack":
        return (
          <PackControls
            packing={p.packing}
            checked={p.checked}
            toggleChecked={p.toggleChecked}
            completed={p.completed}
            onComplete={() => p.setCompleted(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className={cn("flex w-full flex-col overflow-hidden bg-canvas", SCREEN)}>
      {/* Phones: one pane at a time */}
      <div className="flex items-center gap-2 border-b border-line-subtle bg-surface px-3 py-2 lg:hidden">
        <Link href={`/destinations/${destination.slug}`} aria-label={`Back to ${destination.name}`} className="center size-8 rounded-full text-subtle hover:bg-surface-muted">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
        <div className="flex flex-1 gap-1 rounded-full bg-surface-muted p-0.5">
          {[
            { key: "controls", label: "Plan it", icon: SlidersHorizontal },
            { key: "canvas", label: "Live plan", icon: ListTodo },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={mobilePane === key}
              onClick={() => setMobilePane(key)}
              className={cn(
                "relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-caption font-semibold transition",
                mobilePane === key ? "bg-surface text-heading shadow-card" : "text-subtle",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
              {key === "canvas" && (p.task || p.chatBusy) && <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 gap-3 lg:p-3">
        {/* Left: the plan being written */}
        <section
          aria-label="Live plan"
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-y-auto lg:block lg:rounded-card lg:bg-surface-subtle lg:ring-1 lg:ring-line-subtle",
            mobilePane === "canvas" ? "block" : "hidden",
          )}
        >
          <PlanCanvas p={p} destination={destination} facts={facts} backHref={`/destinations/${destination.slug}`} />
        </section>

        {/* Right: where you act */}
        <section
          aria-label="Planning controls"
          className={cn(
            "min-h-0 w-full flex-col overflow-hidden bg-surface lg:flex lg:w-[420px] lg:shrink-0 lg:rounded-card lg:ring-1 lg:ring-line-subtle xl:w-[460px]",
            mobilePane === "controls" ? "flex" : "hidden",
          )}
        >
          <ControlPanel destination={destination} stages={STAGES} p={p}>
            <div key={p.task ? "task" : p.stage} className="pl-rise">
              {controls()}
            </div>
          </ControlPanel>
        </section>
      </div>
    </main>
  );
};

const PlannerSkeleton = () => (
  <main className={cn("flex w-full gap-3 bg-canvas p-3", SCREEN)}>
    <div className="hidden flex-1 rounded-card pl-shimmer lg:block" />
    <div className="w-full rounded-card pl-shimmer lg:w-[420px]" />
  </main>
);

const TripPlannerPage = () => {
  const { destination_id } = useParams();
  const { data, isLoading, error } = useDestinationDetailQuery(destination_id);

  const destination = useMemo(() => {
    const fromApi = data?.data;
    if (fromApi?.name) return { ...fromApi, slug: fromApi.slug || destination_id };
    return { ...DEMO_DESTINATION, slug: destination_id || DEMO_DESTINATION.slug };
  }, [data, destination_id]);

  if (isLoading && !error) return <PlannerSkeleton />;

  // Remount on destination change so the plan starts fresh.
  return <Planner key={destination.slug} destination={destination} />;
};

export default TripPlannerPage;
