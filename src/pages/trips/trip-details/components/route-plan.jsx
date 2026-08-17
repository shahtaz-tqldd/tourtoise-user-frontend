import React, { useMemo } from "react";
import {
  Bus,
  Car,
  Plane,
  RefreshCw,
  Route,
  Ship,
  Train,
} from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "@/components/ui/card";
import { useTripRouteListQuery } from "@/features/trips/tripApiSlice";

const modeIcons = {
  bus: Bus,
  car: Car,
  ferry: Ship,
  boat: Ship,
  train: Train,
  taxi: Car,
  van: Bus,
  plane: Plane,
};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "Date not set";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Anytime";

  const [hour, minute] = String(value).split(":");
  if (hour === undefined || minute === undefined) return value;

  const date = new Date();
  date.setHours(Number(hour || 0), Number(minute || 0), 0, 0);

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatDuration = (value) => {
  if (!value) return "";

  const [hours = "0", minutes = "0"] = String(value).split(":");
  const hourCount = Number(hours);
  const minuteCount = Number(minutes);
  const parts = [];

  if (hourCount) parts.push(`${hourCount}h`);
  if (minuteCount) parts.push(`${minuteCount}m`);

  return parts.join(" ") || value;
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";

  return `$${numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

const unwrapRouteList = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const RouteIcon = ({ mode }) => {
  const normalizedMode = String(mode || "").toLowerCase();
  const key = Object.keys(modeIcons).find((modeKey) =>
    normalizedMode.includes(modeKey),
  );
  const Icon = modeIcons[key] || Route;

  return <Icon size={18} />;
};

const groupRoutesByDate = (routes) =>
  routes.reduce((groups, route) => {
    const routeDate = route.date || "unscheduled";

    return {
      ...groups,
      [routeDate]: [...(groups[routeDate] || []), route],
    };
  }, {});

const sortRoutes = (routes) =>
  [...routes].sort((a, b) => {
    const dateCompare = String(a.date || "").localeCompare(
      String(b.date || ""),
    );
    if (dateCompare !== 0) return dateCompare;

    return String(a.start_time || "").localeCompare(String(b.start_time || ""));
  });

const RoutePlanSkeleton = () => (
  <div className="space-y-4" aria-label="Loading route plan">
    {Array.from({ length: 2 }).map((_, groupIndex) => (
      <section
        key={groupIndex}
        className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-white" />
        </div>
        <div className="relative space-y-4">
          {Array.from({ length: 2 }).map((_, itemIndex) => (
            <div key={itemIndex} className="relative flex gap-2 md:gap-4">
              {itemIndex === 0 ? (
                <span className="absolute left-4 top-9 h-[calc(100%+1rem)] w-px bg-slate-200 md:left-5 md:top-11" />
              ) : null}
              <div className="z-10 size-8 shrink-0 animate-pulse rounded-full bg-white ring-1 ring-slate-200 md:size-10" />
              <div className="min-w-0 flex-1 rounded-lg bg-white p-3 ring-1 ring-slate-200 md:p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-4 w-48 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
                    <div className="flex gap-2">
                      <div className="h-6 w-14 animate-pulse rounded-md bg-slate-100" />
                      <div className="h-6 w-16 animate-pulse rounded-md bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-md bg-primary/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const RouteSegmentCard = ({ segment, isLast }) => {
  const duration = formatDuration(segment.estimated_duration);
  const cost = formatMoney(segment.estimated_cost);

  return (
    <div className="relative flex gap-2 md:gap-4">
      {!isLast && (
        <span className="absolute left-4 top-9 h-[calc(100%+1rem)] w-px bg-slate-300 md:left-5 md:top-11" />
      )}
      <div className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-slate-200 md:size-10">
        <RouteIcon mode={segment.transport_mode} />
      </div>
      <div className="min-w-0 flex-1 rounded-lg bg-white p-3 ring-1 ring-slate-200 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">
              {segment.from_point} to {segment.to_point}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {formatTime(segment.start_time)}
            </p>
            {/* {segment.notes ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {segment.notes}
              </p>
            ) : null} */}
            <div className="flx gap-2 mt-2">
              {duration ? (
                <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {duration}
                </span>
              ) : null}
              {cost ? (
                <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {cost}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="w-fit rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
              {formatLabel(segment.transport_mode)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TripRoutePlan = ({ tripId }) => {
  const { data, isFetching, isError, refetch } = useTripRouteListQuery(
    { trip_id: tripId },
    { skip: !tripId },
  );
  const routeList = useMemo(() => sortRoutes(unwrapRouteList(data)), [data]);
  const groupedRoutes = useMemo(
    () => groupRoutesByDate(routeList),
    [routeList],
  );
  const routeGroups = Object.entries(groupedRoutes);

  return (
    <PreviewCard className="space-y-5 md:rounded-t-none">
      <SectionHeader
        icon={Route}
        title="Route"
        description="Visual movement plan showing origin, destination, vehicle, and timing."
      />

      {isFetching ? <RoutePlanSkeleton /> : null}

      {!isFetching && isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Could not load route plan.
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
        routeGroups.length ? (
          <div className="space-y-4">
            {routeGroups.map(([date, routes]) => (
              <section
                key={date}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-950">
                    {formatDate(date === "unscheduled" ? "" : date)}
                  </h3>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                    {routes.length} route{routes.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="relative space-y-4">
                  {routes.map((segment, index) => (
                    <RouteSegmentCard
                      key={
                        segment.id ||
                        `${segment.date}-${segment.start_time}-${index}`
                      }
                      segment={segment}
                      isLast={index === routes.length - 1}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Route plans"
            description="You have no route-plan added in this trip yet!"
          />
        )
      ) : null}
    </PreviewCard>
  );
};

export default TripRoutePlan;
