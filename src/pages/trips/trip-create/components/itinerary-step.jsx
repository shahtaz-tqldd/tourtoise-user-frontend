import { AuthorMessage, NotificationCard } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import TabMenu from "@/components/ui/tab";
import { useTripItinerariesQuery } from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { CalendarDays, MapPinned, Route, Sparkles, Wallet } from "lucide-react";
import React, { useMemo, useState } from "react";

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const unwrapItinerary = (response) => response?.data || response || {};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatMoney = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "";

  return `$${numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
};

const formatTime = (time) => {
  if (!time) return "Anytime";

  return String(time).split(":").slice(0, 2).join(":");
};

const getItineraryDays = (itinerary) =>
  itinerary.itinerary_days || itinerary.day_wise_plan || [];

const getDayItems = (day) => day.day_items || day.items || [];

const getRoutePlan = (itinerary) =>
  itinerary.route_plan_items || itinerary.route_plan || [];

const itemTypeStyles = {
  food: "bg-amber-50 text-amber-700",
  transfer: "bg-sky-50 text-sky-700",
  activity: "bg-emerald-50 text-emerald-700",
  tour_spot: "bg-primary/10 text-primary",
  rest: "bg-slate-100 text-slate-600",
  free_time: "bg-violet-50 text-violet-700",
};

const ItinerarySkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
      <div className="mb-3 h-5 w-2/3 animate-pulse rounded-full bg-primary/10" />
      <div className="h-3 w-full animate-pulse rounded-full bg-primary/10" />
    </div>
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="mb-4 h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const DayTabs = ({ days, activeDay, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {days.map((day) => {
      const isActive = activeDay === day.day;

      return (
        <button
          key={day.day}
          type="button"
          onClick={() => onChange(day.day)}
          className={`min-w-[92px] rounded-lg border px-3 py-2 text-left transition ${
            isActive
              ? "border-primary bg-primary/10 text-primary"
              : "border-slate-200 bg-white text-slate-600 hover:border-primary/40"
          }`}
        >
          <span className="block text-sm font-semibold">Day {day.day}</span>
          <span className="text-xs">{formatDate(day.date)}</span>
        </button>
      );
    })}
  </div>
);

const TimelineItem = ({ item, isLast }) => (
  <div className="relative flex gap-3">
    <div className="flex w-16 shrink-0 justify-end pt-1 text-xs font-medium text-slate-500">
      {formatTime(item.time)}
    </div>
    <div className="relative flex flex-col items-center">
      <span className="size-3 rounded-full border-2 border-primary bg-white" />
      {!isLast && <span className="h-full w-px bg-slate-200" />}
    </div>
    <div className="min-w-0 flex-1 pb-4">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold leading-5 text-slate-950">
            {item.title}
          </h4>
          {item.item_type && (
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                itemTypeStyles[item.item_type] || "bg-slate-100 text-slate-600"
              }`}
            >
              {formatLabel(item.item_type)}
            </span>
          )}
        </div>
        <p className="text-sm leading-6 text-slate-600">{item.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {item.estimated_cost !== null &&
            item.estimated_cost !== undefined && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                {formatMoney(item.estimated_cost) || "Free"}
              </span>
            )}
          {item.notes && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              {item.notes}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const RouteCard = ({ route }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="mb-2 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">
          {route.from_point} to {route.to_point}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDate(route.date)} · {formatTime(route.start_time)}
        </p>
      </div>
      <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">
        {formatLabel(route.transport_mode)}
      </span>
    </div>
    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
      {route.estimated_duration && (
        <span className="rounded-full bg-slate-100 px-2.5 py-1">
          {route.estimated_duration}
        </span>
      )}
      {route.estimated_cost && (
        <span className="rounded-full bg-slate-100 px-2.5 py-1">
          {formatMoney(route.estimated_cost)}
        </span>
      )}
    </div>
    {route.notes && (
      <p className="mt-2 text-sm leading-6 text-slate-600">{route.notes}</p>
    )}
  </div>
);

const BudgetRow = ({ label, value, highlight }) => (
  <div
    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
      highlight ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-700"
    }`}
  >
    <span className="text-sm font-medium">{label}</span>
    <span className="text-sm font-semibold">{formatMoney(value) || "-"}</span>
  </div>
);

const itineraryTabs = [
  { value: "days", label: "Days", icon: CalendarDays },
  { value: "routes", label: "Routes", icon: Route },
  { value: "budget", label: "Budget", icon: Wallet },
];

const ItineraryStep = ({ trip, onStepComplete, onStepSelect }) => {
  const tripId = getTripId(trip);
  const [view, setView] = useState("days");
  const { data, isLoading, isFetching, isError } = useTripItinerariesQuery(
    tripId ? { trip_id: tripId } : skipToken,
  );
  const itinerary = useMemo(() => unwrapItinerary(data), [data]);
  const days = getItineraryDays(itinerary);
  const routePlan = getRoutePlan(itinerary);
  const [activeDay, setActiveDay] = useState(days[0]?.day || 1);
  const activeDayPlan = days.find((day) => day.day === activeDay) || days[0];
  const activeDayItems = getDayItems(activeDayPlan || {});
  const budget = itinerary.rough_budget || {};
  const currentStep = Number(trip?.current_step);
  const isPreparationComplete = Number.isFinite(currentStep) && currentStep > 5;
  const preparationButtonLabel = isPreparationComplete
    ? "Show preparations"
    : "Start preparations";

  if (isLoading || isFetching) {
    return <ItinerarySkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Could not load the itinerary. Try reopening this step in a moment.
      </div>
    );
  }

  if (!days.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        No itinerary has been generated yet.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <AuthorMessage
          title={itinerary.title || "Day wise itinerary"}
          message={itinerary.summary || itinerary.message}
        />

        <div className="sticky -top-4 z-10 bg-white pt-1">
          <TabMenu
            tabs={itineraryTabs}
            activeTab={view}
            setActiveTab={setView}
          />
        </div>

        {view === "days" && activeDayPlan && (
          <div className="space-y-4">
            <DayTabs
              days={days}
              activeDay={activeDayPlan.day}
              onChange={setActiveDay}
            />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Day {activeDayPlan.day} · {formatDate(activeDayPlan.date)}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">
                  {activeDayPlan.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {activeDayPlan.summary}
                </p>
              </div>
              <div>
                {activeDayItems.map((item, index) => (
                  <TimelineItem
                    key={`${item.time}-${item.title}-${index}`}
                    item={item}
                    isLast={index === activeDayItems.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "routes" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <MapPinned size={16} className="text-primary" />
              Route plan
            </div>
            {routePlan.length ? (
              routePlan.map((route, index) => (
                <RouteCard
                  key={`${route.date}-${route.start_time}-${index}`}
                  route={route}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No route plan available.
              </div>
            )}
          </div>
        )}

        {view === "budget" && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Wallet size={16} className="text-primary" />
              Rough budget
            </div>
            <div className="grid gap-2">
              <BudgetRow label="Transport" value={budget.transport} />
              <BudgetRow label="Food" value={budget.food} />
              <BudgetRow label="Activities" value={budget.activities} />
              <BudgetRow
                label="Tickets or entry"
                value={budget.tickets_or_entry}
              />
              <BudgetRow label="Miscellaneous" value={budget.miscellaneous} />
              <BudgetRow
                label="Total estimated"
                value={budget.total_estimated_budget}
                highlight
              />
            </div>
            {budget.budget_note && (
              <p className="text-sm leading-6 text-slate-600">
                {budget.budget_note}
              </p>
            )}
          </div>
        )}

        {itinerary.revision_instruction && (
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
            {itinerary.revision_instruction}
          </div>
        )}

        {(itinerary.is_finalized || itinerary.is_itinerary_complete) && (
          <NotificationCard
            message="Itinerary planning is complete. Review the days, routes, and budget
            before moving forward."
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onStepSelect?.(2)}
        >
          View Recommendations
        </Button>

        <Button type="button" onClick={() => onStepComplete?.()}>
          <Sparkles size={17} />
          {preparationButtonLabel}
        </Button>
      </div>
    </div>
  );
};

export default ItineraryStep;
