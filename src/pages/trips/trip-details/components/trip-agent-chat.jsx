import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bell, Loader2, MessageSquareDot } from "lucide-react";
import Card from "@/components/ui/card";
import TabMenu from "@/components/ui/tab";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import ChatInputForm from "@/pages/chat/components/chat-input-form";
import { AuthorMessage } from "@/components/shared/utils";
import { cn } from "@/lib/utils";
import NotificationList from "@/features/notification/notification-list";
import {
  useCreateTripMessageMutation,
  useTripMessageListQuery,
} from "@/features/trips/tripApiSlice";

const asideTabs = [
  { value: "chat", label: "Trip Assistant", icon: MessageSquareDot },
  { value: "notifications", label: "Notifications", icon: Bell },
];

const unwrapMessages = (response) => {
  const payload = response?.data || response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;

  return [];
};

const normalizeMessage = (item) => {
  const sender = item.sender || item.role || item.author_type;
  const isUser = sender === "user" || sender === "human";

  return {
    id: item.id || item.message_id || item.uuid || `${sender}-${item.sequence}`,
    role: isUser ? "user" : "agent",
    content: item.content || item.message || item.text || "",
    sequence: item.sequence,
    created_at: item.created_at,
  };
};

const TripAgentChat = ({
  tripId,
  sessionId,
  notificationUnreadCount = 0,
  showTabs = true,
  activeSection = "chat",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const selectedSection = showTabs ? activeTab : activeSection;
  const tabs = useMemo(
    () =>
      asideTabs.map((tab) =>
        tab.value === "notifications"
          ? { ...tab, unreadCount: notificationUnreadCount }
          : tab,
      ),
    [notificationUnreadCount],
  );

  return (
    <Card
      className={cn(
        "flex h-[calc(100vh-7rem)] min-h-[560px] min-w-0 flex-col p-0 md:p-6 bg-transparent md:bg-white rounded-none md:rounded-2xl",
        className,
      )}
    >
      {showTabs && (
        <TabMenu
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="-mt-3 shrink-0 -mx-6 px-6 pt-1 md:pt-0"
        />
      )}
      {selectedSection === "chat" && (
        <ChatSection sessionId={sessionId} tripId={tripId} />
      )}
      {selectedSection === "notifications" && (
        <NotificationSection tripId={tripId} />
      )}
    </Card>
  );
};

const ChatSection = ({ tripId, sessionId }) => {
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState(null);
  const composerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const {
    data: messageListResponse,
    isFetching: isFetchingMessages,
    isError: isMessageListError,
    refetch: refetchMessages,
  } = useTripMessageListQuery(
    {
      trip_id: tripId,
      session_id: sessionId,
      page: 1,
      page_size: 100,
    },
    { skip: !tripId || !sessionId },
  );
  const [createTripMessage, { isLoading: isSendingMessage }] =
    useCreateTripMessageMutation();

  const messages = useMemo(
    () =>
      unwrapMessages(messageListResponse)
        .map(normalizeMessage)
        .sort((a, b) => {
          if (a.sequence !== undefined || b.sequence !== undefined) {
            return Number(a.sequence || 0) - Number(b.sequence || 0);
          }

          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }),
    [messageListResponse],
  );
  const renderedMessages = useMemo(
    () => (pendingMessage ? [...messages, pendingMessage] : messages),
    [messages, pendingMessage],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [renderedMessages.length, isSendingMessage, isFetchingMessages]);

  const submitMessage = useCallback(
    async (nextMessage) => {
      const trimmedMessage = nextMessage.trim();
      if (!trimmedMessage || isSendingMessage || !tripId || !sessionId) return;

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedMessage,
      };

      setMessage("");
      setPendingMessage(userMessage);

      try {
        await createTripMessage({
          trip_id: tripId,
          session_id: sessionId,
          payload: { message: trimmedMessage },
        }).unwrap();
        refetchMessages();
      } catch (error) {
        setMessage(trimmedMessage);
        toast.error(getApiErrorMessage(error, "Could not send message."));
      } finally {
        setPendingMessage(null);
      }
    },
    [createTripMessage, isSendingMessage, refetchMessages, sessionId, tripId],
  );

  if (!sessionId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="center min-h-0 flex-1 px-4 text-center">
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
            Trip chat session is not available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="hidden-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pt-3">
        {isFetchingMessages && !renderedMessages.length ? (
          <div className="center py-8 text-sm font-medium text-slate-500">
            <Loader2 className="mr-2 animate-spin" size={16} />
            Loading messages...
          </div>
        ) : isMessageListError ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            Could not load trip messages.
          </div>
        ) : renderedMessages.length ? (
          renderedMessages.map((message, index) =>
            message.role === "user" ? (
              <div
                key={message.id || index}
                className="max-w-[88%] w-fit overflow-hidden rounded-2xl px-4 py-3 text-sm leading-6 break-words whitespace-pre-wrap ml-auto rounded-tr-md bg-primary text-white"
              >
                {message.content}
              </div>
            ) : (
              <AuthorMessage message={message.content} />
            ),
          )
        ) : (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 break-words text-slate-600">
            No agent messages available yet.
          </p>
        )}
        {isSendingMessage && (
          <p className="px-1 text-xs font-semibold text-slate-400">
            turtle is typing
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white pt-3">
        <ChatInputForm
          composerRef={composerRef}
          message={message}
          onSubmitMessage={submitMessage}
          onMessageChange={setMessage}
          isSendingMessage={isSendingMessage}
        />
      </div>
    </div>
  );
};

const NotificationSection = ({ tripId }) => {
  return (
    <NotificationList
      scopeParams={{ trip_id: tripId }}
      pageSize={20}
      className="flex min-h-0 flex-1 flex-col py-4 pr-1"
      itemClassName="bg-slate-50"
      emptyMessage="No trip notifications available yet."
    />
  );
};

export default TripAgentChat;
