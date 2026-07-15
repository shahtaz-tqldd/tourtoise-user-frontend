import React, { useMemo, useState } from "react";
import { PreviewCard } from "@/components/ui/card";
import {
  Bed,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  MapPin,
  RefreshCw,
  Sparkle,
  Utensils,
} from "lucide-react";
import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { formatDate } from "@/lib/date-time";
import { useDaywisePlanListQuery } from "@/features/trips/tripApiSlice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const itemTypeIconMap = {
  cuisine: <Utensils size={13} aria-hidden="true" />,
  activity: <Sparkle size={13} aria-hidden="true" />,
  attraction: <MapPin size={13} aria-hidden="true" />,
  rest: <Bed size={13} aria-hidden="true" />,
  transfer: <Car size={13} aria-hidden="true" />,
};

const fallbackItemTypeIcon = <CheckCircle2 size={13} aria-hidden="true" />;

const getItemTypeIcon = (type) => itemTypeIconMap[type] || fallbackItemTypeIcon;

const formatTime = (value) => {
  if (!value) return "";

  const [hour, minute] = String(value).split(":");
  if (hour === undefined || minute === undefined) return value;

  const date = new Date();
  date.setHours(Number(hour || 0), Number(minute || 0), 0, 0);

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const unwrapDayWisePlan = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const sortDayPlans = (days) =>
  [...days].sort((a, b) => {
    const dayCompare = Number(a.day || 0) - Number(b.day || 0);
    if (dayCompare !== 0) return dayCompare;

    return String(a.date || "").localeCompare(String(b.date || ""));
  });

const sortDayItems = (items = []) =>
  [...items].sort((a, b) => {
    if (!a.time && b.time) return 1;
    if (a.time && !b.time) return -1;

    return String(a.time || "").localeCompare(String(b.time || ""));
  });

const DayWisePlanSkeleton = () => (
  <div className="space-y-3" aria-label="Loading day-wise plan">
    {Array.from({ length: 3 }).map((_, dayIndex) => (
      <article key={dayIndex} className="rounded-lg border border-slate-200">
        <div className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-36 animate-pulse rounded-full bg-primary/10" />
            <div className="h-4 w-48 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="mt-1 size-5 animate-pulse rounded bg-slate-100" />
        </div>
        {dayIndex === 0 ? (
          <div className="space-y-4 border-t border-slate-200 p-4">
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="grid gap-3">
              {Array.from({ length: 2 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="rounded-lg bg-white p-4 ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-md bg-slate-100" />
                    <div className="h-6 w-20 animate-pulse rounded-md bg-primary/10" />
                    <div className="h-6 w-14 animate-pulse rounded-md bg-slate-100" />
                  </div>
                  <div className="mt-3 h-4 w-44 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    ))}
  </div>
);

const TripDayWisePlan = ({ tripId }) => {
  const { data, isFetching, isError, refetch } = useDaywisePlanListQuery(
    { trip_id: tripId },
    { skip: !tripId },
  );
  const days = useMemo(() => sortDayPlans(unwrapDayWisePlan(data)), [data]);

  return (
    <PreviewCard className="space-y-5 md:rounded-t-none">
      <SectionHeader
        icon={CalendarDays}
        title="Day wise plan"
        description="A readable daily structure that the agent can continue refining."
      />

      {isFetching ? <DayWisePlanSkeleton /> : null}

      {!isFetching && isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Could not load day-wise plan.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 bg-white"
            onClick={refetch}
          >
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      ) : null}

      {!isFetching && !isError ? (
        days.length ? (
          <DayAccordion days={days} />
        ) : (
          <EmptyState
            title="No day-wise plans"
            description="You have no day-wise plan added in this trip yet!"
          />
        )
      ) : null}
    </PreviewCard>
  );
};

const DayPlanItem = ({ item }) => {
  const time = formatTime(item.time);
  const itemTypeIcon = getItemTypeIcon(item.item_type);
  const itemTypeLabel = formatLabel(item.item_type || "Other");

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {time ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                <Clock3 size={13} />
                {time}
              </span>
            ) : null}
            <div
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              title={itemTypeLabel}
              aria-label={itemTypeLabel}
            >
              {itemTypeIcon}
              <span>{formatLabel(item.item_type)}</span>
            </div>
          </div>
          <h4 className="mt-3 text-sm font-semibold text-slate-950">
            {item.title}
          </h4>
          {item.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          ) : null}
          {item.notes ? (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              <Info size={15} className="mt-1 shrink-0 text-primary" />
              <span>{item.notes}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const DayAccordion = ({ days }) => {
  const [openDay, setOpenDay] = useState(days[0]?.day);
  const activeOpenDay =
    openDay === null || days.some((day) => day.day === openDay)
      ? openDay
      : days[0]?.day;

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const isOpen = activeOpenDay === day.day;
        const items = sortDayItems(day.items);

        return (
          <article
            key={day.id || day.day}
            className={cn(
              "rounded-xl border  overflow-hidden",
              isOpen ? "border-primary/30" : "border-slate-200",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenDay(isOpen ? null : day.day)}
              className={cn(
                "flex w-full items-start justify-between gap-4 p-4 text-left",
                isOpen ? "bg-primary/10" : "bg-white",
              )}
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
              <div className="space-y-4 border-t border-primary/30 p-4 bg-primary/5">
                {day.summary ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {day.summary}
                  </p>
                ) : null}
                {items.length ? (
                  <div className="grid gap-3">
                    {items.map((item, index) => (
                      <DayPlanItem
                        key={item.id || `${day.day}-${item.title}-${index}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                    No activities listed for this day.
                  </p>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default TripDayWisePlan;
