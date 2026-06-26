import { AuthorMessage, NotificationCard } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import {
  useLazyTripActivateQuery,
  useTripOverviewQuery,
} from "@/features/trips/tripApiSlice";
import { formatLabel } from "@/lib/utils";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Loader2,
  MapPin,
  Plus,
  Route,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const unwrapOverview = (response) => response?.data || response || {};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "Dates not set";
  if (startDate && !endDate) return `Starts ${startDate}`;

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(`${startDate}T00:00:00`))} - ${formatter.format(new Date(`${endDate}T00:00:00`))}`;
};

const OverviewSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-amber-100" />
      <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-amber-100" />
    </div>
    {[0, 1, 2, 3].map((index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="mb-4 h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-3">
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
  </div>
);

const CountCard = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 px-3 py-2">
    <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
    <p className="mt-1 text-lg font-semibold text-slate-950">{value || 0}</p>
  </div>
);

const SectionCard = ({ title, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
    <div className="mt-3">{children}</div>
  </section>
);

const OverviewStep = ({ trip }) => {
  const tripId = getTripId(trip);
  const { data, isLoading, isFetching, isError } = useTripOverviewQuery(
    tripId ? { trip_id: tripId } : skipToken,
  );
  const [activateTrip, { isFetching: isActivating }] =
    useLazyTripActivateQuery();
  const overview = useMemo(() => unwrapOverview(data), [data]);
  const tripOverview = overview.trip || {};
  const recommendations = overview.recommendations_overview || {};
  const itinerary = overview.itinerary_overview || {};
  const preparation = overview.preparation_overview || {};
  const navigate = useNavigate();
  const handleTripRedirect = (id) => {
    navigate(`/trips/${id}`);
  };

  const handleActivateTrip = async () => {
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    try {
      await activateTrip({ trip_id: tripId }).unwrap();
      toast.success("Trip is ready.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not activate this trip.");
    }
  };

  if (isLoading || isFetching) return <OverviewSkeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Could not load the trip overview. Try reopening this step in a moment.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {tripOverview.status === "draft" && (
          <NotificationCard
            title="This trip is saved as draft"
            message="Review the overview below. You can proceed with this trip or
              delete it and start again."
          />
        )}

        <AuthorMessage
          message={
            preparation.summary ||
            "Review the final planning summary before locking the trip."
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<CalendarDays size={16} />}
            label="Dates"
            value={formatDateRange(
              tripOverview.start_date,
              tripOverview.end_date,
            )}
          />
          <StatCard
            icon={<Route size={16} />}
            label="Duration"
            value={`${tripOverview.duration_days || "-"} days`}
          />
          <StatCard
            icon={<UserRound size={16} />}
            label="Travelers"
            value={`${tripOverview.travelers_count || "-"} ${formatLabel(
              tripOverview.traveler_type || "traveler",
            )}`}
          />
          <StatCard
            icon={<Wallet size={16} />}
            label="Est. Budget"
            value={itinerary.total_estimated_budget}
          />
        </div>

        <SectionCard title="Destinations">
          <div className="space-y-2">
            {(overview.destinations || []).map((destination) => (
              <div
                key={destination.id || destination.name}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <MapPin size={15} className="shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium text-slate-800">
                    {destination.name}, {destination.country}
                  </span>
                </div>
                {destination.is_primary && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    Primary
                  </span>
                )}
              </div>
            ))}
            {tripOverview.origin?.start_location && (
              <p className="text-sm leading-6 text-slate-600">
                Starts from {tripOverview.origin.start_location}
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Plan coverage">
          <div className="grid grid-cols-3 gap-2">
            <CountCard
              label="Spots"
              value={recommendations.attractions_count}
            />
            <CountCard
              label="Activities"
              value={recommendations.activities_count}
            />
            <CountCard
              label="Packing"
              value={preparation.packing_items_count}
            />
            <CountCard label="Documents" value={preparation.documents_count} />
          </div>
          {itinerary.budget_note && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {itinerary.budget_note}
            </p>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4">
        <Button type="button" variant="outline" disabled={isActivating}>
          <Plus size={17} />
          Start a New Plan
        </Button>
        {tripOverview.status !== "ready" ? (
          <Button
            type="button"
            onClick={handleActivateTrip}
            disabled={isActivating}
          >
            {isActivating ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}
            Complete Trip Planning
          </Button>
        ) : (
          <Button onClick={() => handleTripRedirect(tripOverview.id)}>
            <ArrowUpRight size={17} />
            View Your Trip
          </Button>
        )}
      </div>
    </div>
  );
};

export default OverviewStep;
