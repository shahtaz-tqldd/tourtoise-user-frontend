import React, { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

// components
import Card from "@/components/ui/card";
import TabMenu from "@/components/ui/tab";
import TripAgentChat from "./components/chat";
import TripOverview from "./components/overview";
import TripPlanningTabs from "./components/planning-tabs";

//icons
import {
  Backpack,
  Bell,
  Loader2,
  MessageSquareDot,
  Sparkles,
} from "lucide-react";

// lib
import {
  useTripDetailQuery,
  useTripMessageListQuery,
} from "@/features/trips/tripApiSlice";
import { useNotificationListQuery } from "@/features/notification/notificationApiSlice";
import useNotificationSocket from "@/features/notification/useNotificationSocket";
import useTitle from "@/hooks/useTitle";
import TripNotes from "./components/notes";
import { Container } from "@/components/ui/container";
import BrokenPage from "@/components/shared/broken-page";

const mobileTabs = [
  { value: "overview", label: "Overview", icon: Sparkles },
  {
    value: "assistant",
    label: "Trip Assistant",
    icon: MessageSquareDot,
  },
  { value: "notifications", label: "Notification", icon: Bell },
];

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
      sourceTrip.planning_description ||
      sourceTrip.planning_summary ||
      itinerary.summary ||
      preparation.summary ||
      "No planning summary available yet.",
    budget: sourceTrip.budget || itinerary.rough_budget || {},
    budget_currency:
      sourceTrip.budget?.currency || sourceTrip.budget_currency || "USD",
    preparation_stats: sourceTrip.preparation_stats || {
      packing_items: {
        total_count: packingItems.length,
        is_packed_count: packingItems.filter((item) => item.packed).length,
      },
      documents: {
        total_count: preparationDocuments.length,
        is_packed_count: preparationDocuments.filter(
          (document) => document.is_packed,
        ).length,
      },
    },
    trip_pace: preferences.travel_pace || sourceTrip.traveler_type || "custom",
    destinations: (sourceTrip.trip_destinations || []).map((destination) => ({
      id:
        destination.id ||
        destination.destination?.slug ||
        destination.destination?.name,
      slug:
        destination.destination?.slug ||
        destination.slug ||
        destination.destination_slug ||
        "",
      name:
        destination.destination?.name ||
        destination.name ||
        destination.title ||
        sourceTrip.title,
      country: destination.destination?.country || destination.country || "",
      region: destination.destination?.region || destination.region || "",
      tagline: destination.destination?.tagline || destination.tagline || "",
      destination_type:
        destination.destination?.destination_type ||
        destination.destination_type ||
        "",
      tags: destination.destination?.tags || destination.tags || [],
      arrival_date: destination.arrival_date || "",
      departure_date: destination.departure_date || "",
      stay:
        destination.stay ||
        destination.role ||
        (destination.is_primary ? "Primary destination" : "Trip destination"),
      image_url:
        destination.destination?.cover_image ||
        destination.cover_image ||
        destination.image_url,
      summary:
        destination.destination?.description ||
        destination.destination?.overview ||
        destination.summary ||
        destination.destination?.tagline ||
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
  useTitle("Trip Details");
  const { trip_id } = useParams();
  const [activeMobileTab, setActiveMobileTab] = useState("overview");
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [unreadCountOverrides, setUnreadCountOverrides] = useState({});
  const receivedSocketMessageIdsRef = useRef(new Set());

  const { data, isFetching, isError } = useTripDetailQuery(trip_id);
  const { data: notificationData, refetch: refetchNotifications } =
    useNotificationListQuery({
      trip_id,
      page: 1,
      page_size: 1,
    });
  const trip = useMemo(
    () => normalizeTripDetail(unwrapTripDetail(data)),
    [data],
  );
  const chatSessionId = trip?.is_chat_available
    ? trip.conversation_session_id
    : null;
  const { data: messageData } = useTripMessageListQuery(
    {
      trip_id,
      session_id: chatSessionId,
      page: 1,
      page_size: 1,
    },
    { skip: !trip_id || !chatSessionId },
  );
  const notificationUnreadCount = notificationData?.meta?.unread_count || 0;
  const serverMessageUnreadCount = Number(messageData?.meta?.unread_count || 0);
  const messageUnreadCount =
    unreadCountOverrides[chatSessionId] ?? serverMessageUnreadCount;
  const tabs = useMemo(
    () =>
      mobileTabs.map((tab) => {
        if (tab.value === "assistant") {
          return { ...tab, unreadCount: messageUnreadCount };
        }
        if (tab.value === "notifications") {
          return { ...tab, unreadCount: notificationUnreadCount };
        }
        return tab;
      }),
    [messageUnreadCount, notificationUnreadCount],
  );

  const handleSocketNotification = useCallback(
    (notification) => {
      if (notification?.trip_id === trip_id) {
        refetchNotifications();
      }
    },
    [refetchNotifications, trip_id],
  );

  const handleSocketTripMessage = useCallback(
    (socketEvent) => {
      if (
        !chatSessionId ||
        socketEvent?.conversation_id !== chatSessionId ||
        !socketEvent.message
      ) {
        return;
      }

      const socketMessageKey = `${socketEvent.conversation_id}-${socketEvent.message.id}`;
      if (receivedSocketMessageIdsRef.current.has(socketMessageKey)) return;
      receivedSocketMessageIdsRef.current.add(socketMessageKey);

      setIncomingMessages((currentMessages) => {
        return [...currentMessages, socketEvent.message];
      });

      if (socketEvent.message.sender === "agent") {
        setUnreadCountOverrides((currentCounts) => ({
          ...currentCounts,
          [chatSessionId]:
            (currentCounts[chatSessionId] ?? serverMessageUnreadCount) + 1,
        }));
      }
    },
    [chatSessionId, serverMessageUnreadCount],
  );

  const handleMessagesRead = useCallback(() => {
    if (!chatSessionId) return;

    setUnreadCountOverrides((currentCounts) => ({
      ...currentCounts,
      [chatSessionId]: 0,
    }));
  }, [chatSessionId]);

  useNotificationSocket({
    enabled: Boolean(trip_id),
    onNotification: handleSocketNotification,
    onTripMessage: handleSocketTripMessage,
  });

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
      <BrokenPage
        title="Trip not found"
        description={`We couldn't find your trip on this with this record! Check your trip id.`}
        icon={Backpack}
        actionLabel="Create new Trip"
      />

      // <Card className="text-center min-h-60">
      //   <h1 className="text-xl font-bold text-slate-950">
      //     Trip details unavailable
      //   </h1>
      //   <p className="mt-2 text-sm text-slate-500">
      //     Could not load this trip from the API.
      //   </p>
      // </Card>
    );
  }

  return (
    <Container className="py-0 md:py-5">
      <section className="hidden gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-5">
          <TripOverview trip={trip} />
          <TripPlanningTabs key={trip.id} trip={trip} />
          <TripNotes tripId={trip.id} />
        </div>

        <TripAgentChat
          messages={trip.chat}
          tripId={trip.id}
          sessionId={chatSessionId}
          incomingMessages={incomingMessages}
          messageUnreadCount={messageUnreadCount}
          onMessagesRead={handleMessagesRead}
          notificationUnreadCount={notificationUnreadCount}
          className="sticky top-[92px]"
        />
      </section>

      <section
        className={cn(
          "xl:hidden",
          activeMobileTab === "overview"
            ? "pt-0 pb-18 md:pt-5 md:pb-5"
            : "flex h-[calc(100dvh-3rem)] min-h-0 flex-col overflow-hidden pb-[calc(env(safe-area-inset-bottom)+4.5rem)]",
        )}
      >
        <TabMenu
          tabs={tabs}
          activeTab={activeMobileTab}
          setActiveTab={setActiveMobileTab}
          className={cn(
            "z-[30] -mx-2.5 bg-white px-4 pt-1.5",
            activeMobileTab === "overview" ? "sticky top-14" : "shrink-0",
          )}
        />

        <div
          className={cn(
            "mt-0",
            activeMobileTab !== "overview" && "min-h-0 flex-1 overflow-hidden",
          )}
        >
          {activeMobileTab === "overview" && (
            <div className="space-y-5">
              <TripOverview trip={trip} />
              <TripPlanningTabs key={trip.id} trip={trip} />
              <TripNotes tripId={trip.id} />
            </div>
          )}

          {activeMobileTab === "assistant" && (
            <TripAgentChat
              tripId={trip.id}
              sessionId={chatSessionId}
              incomingMessages={incomingMessages}
              messageUnreadCount={messageUnreadCount}
              onMessagesRead={handleMessagesRead}
              notificationUnreadCount={notificationUnreadCount}
              showTabs={false}
              activeSection="chat"
              className="h-full min-h-0 rounded-none md:rounded-3xl"
            />
          )}

          {activeMobileTab === "notifications" && (
            <TripAgentChat
              tripId={trip.id}
              sessionId={chatSessionId}
              messageUnreadCount={messageUnreadCount}
              notificationUnreadCount={notificationUnreadCount}
              showTabs={false}
              activeSection="notifications"
              className="h-full min-h-0 rounded-none md:rounded-3xl"
            />
          )}
        </div>
      </section>
    </Container>
  );
};

export default TripDetailPage;
