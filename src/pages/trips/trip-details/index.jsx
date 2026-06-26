import Card from "@/components/ui/card";
import { useTripDetailQuery } from "@/features/trips/tripApiSlice";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import TripAgentChat from "./components/trip-agent-chat";
import TripNotesAlerts from "./components/trip-notes-alerts";
import TripOverview from "./components/trip-overview";
import TripPlanningTabs from "./components/trip-planning-tabs";

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
      <Card className="text-center min-h-60">
        <h1 className="text-xl font-bold text-slate-950">
          Trip details unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Could not load this trip from the API.
        </p>
      </Card>
    );
  }

  return (
    <section className="grid gap-6 py-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-5">
        <TripOverview trip={trip} />
        <TripPlanningTabs trip={trip} />
        <TripNotesAlerts notes={trip.notes} alerts={trip.alerts} />
      </div>

      <TripAgentChat messages={trip.chat} />
    </section>
  );
};

export default TripDetailPage;
