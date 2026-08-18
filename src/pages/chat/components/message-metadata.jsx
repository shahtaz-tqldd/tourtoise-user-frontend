import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  Loader2,
  MapPin,
  Route,
  Sparkles,
  TriangleAlert,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { formatDate } from "@/lib/date-time";

const formatLabel = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const DestinationCard = ({ destination }) => {
  const location = [destination.name, destination.country]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="rounded-xl border border-primary/15 bg-white p-3.5 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="flex items-center gap-1.5 font-bold text-slate-950">
            <MapPin size={16} className="shrink-0 text-primary" />
            <span>{location || "Recommended destination"}</span>
          </h4>
          {destination.previously_visited && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
              <Check size={13} className="text-primary" /> Previously visited
            </p>
          )}
        </div>
        {destination.budget_tier && (
          <Badge>{formatLabel(destination.budget_tier)} budget</Badge>
        )}
      </div>

      {destination.why_it_matches && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {destination.why_it_matches}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
        {destination.ideal_duration && (
          <span className="flex items-center gap-1.5">
            <Clock3 size={14} className="text-primary" />
            {destination.ideal_duration}
          </span>
        )}
        {destination.seasonal_suitability && (
          <span className="flex items-start gap-1.5">
            <CalendarDays size={14} className="mt-px shrink-0 text-primary" />
            {destination.seasonal_suitability}
          </span>
        )}
      </div>

      {!!destination.matched_preferences?.length && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {destination.matched_preferences.map((preference) => (
            <span
              key={preference}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
            >
              {preference}
            </span>
          ))}
        </div>
      )}

      {destination.concern_or_tradeoff && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <span>{destination.concern_or_tradeoff}</span>
        </div>
      )}

      {destination.destination_slug && (
        <Button
          asChild
          variant="outline"
          className="mt-4 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary rounded-full !pl-5"
        >
          <Link to={`/destinations/${destination.destination_slug}`}>
            View destination <ArrowUpRight size={14} />
          </Link>
        </Button>
      )}
    </article>
  );
};

const SummaryItem = ({ icon: Icon, label, value }) => {
  if (!value) return null;

  return (
    <div className="flex items-start gap-2">
      {React.createElement(Icon, {
        size: 15,
        className: "mt-0.5 shrink-0 text-primary",
      })}
      <div className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className="block text-xs font-semibold leading-5 text-slate-700">
          {value}
        </span>
      </div>
    </div>
  );
};

const HandoffCard = ({ destination, handoff, onStartPlanning }) => {
  const [isOpeningPlanner, setIsOpeningPlanner] = React.useState(false);
  const destinationName = destination?.name;
  const travelDate = handoff.start_date || handoff.preferred_month;
  const duration = handoff.duration_days
    ? `${handoff.duration_days} day${handoff.duration_days === 1 ? "" : "s"}`
    : null;
  const travellers = handoff.traveller_count
    ? `${handoff.traveller_count} traveller${handoff.traveller_count === 1 ? "" : "s"}`
    : handoff.traveller_type;

  const handleStartPlanning = async () => {
    if (!onStartPlanning || isOpeningPlanner) return;

    setIsOpeningPlanner(true);
    try {
      await onStartPlanning({ destination, handoff });
    } finally {
      setIsOpeningPlanner(false);
    }
  };

  return (
    <section className="rounded-xl border border-primary/20 bg-white p-3.5 sm:p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Route size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-950">
            Your planning summary
          </h4>
          <p className="text-xs text-slate-500">Ready to turn into a trip</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SummaryItem
          icon={MapPin}
          label="Destination"
          value={destinationName}
        />
        <SummaryItem
          icon={MapPin}
          label="Leaving from"
          value={handoff.departure_location}
        />
        <SummaryItem
          icon={CalendarDays}
          label="Travel date"
          value={formatDate(travelDate)}
        />
        <SummaryItem icon={Clock3} label="Duration" value={duration} />
        <SummaryItem icon={Users} label="Travellers" value={travellers} />
        <SummaryItem
          icon={WalletCards}
          label="Budget"
          value={formatLabel(handoff.budget_tier)}
        />
        <SummaryItem
          icon={Sparkles}
          label="Interests"
          value={handoff.interests?.join(", ")}
        />
        <SummaryItem
          icon={Compass}
          label="Dietary preferences"
          value={handoff.dietary_preferences?.join(", ")}
        />
        <SummaryItem
          icon={Check}
          label="Mobility"
          value={handoff.mobility_constraints?.join(", ")}
        />
      </div>

      <Button
        type="button"
        className="mt-4 rounded-full !pr-4"
        disabled={
          isOpeningPlanner ||
          (!handoff.destination_slug && !handoff.destination_id)
        }
        onClick={handleStartPlanning}
      >
        {isOpeningPlanner ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <ArrowRight size={16} />
        )}
        {isOpeningPlanner ? "Opening planner..." : "Start planning"}
      </Button>
    </section>
  );
};

const MessageMetadata = ({ handoffDestination, metadata, onStartPlanning }) => {
  const destinations = Array.isArray(metadata?.destinations)
    ? metadata.destinations
    : [];
  const handoff = metadata?.handoff;

  if (!destinations.length && !handoff) return null;

  return (
    <div className="mt-3 space-y-3 ml-11 md:max-w-[82%]">
      {destinations.map((destination, index) => (
        <DestinationCard
          key={`${destination.name}-${index}`}
          destination={destination}
        />
      ))}
      {handoff && (
        <HandoffCard
          destination={handoffDestination}
          handoff={handoff}
          onStartPlanning={onStartPlanning}
        />
      )}
    </div>
  );
};

export default MessageMetadata;
