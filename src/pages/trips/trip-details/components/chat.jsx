import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bell, MessageSquareDot } from "lucide-react";
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
  useTripMessageInfiniteListInfiniteQuery,
} from "@/features/trips/tripApiSlice";

const MESSAGE_PAGE_SIZE = 20;

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
  const isSystem = sender === "system";

  return {
    id: item.id || item.message_id || item.uuid || `${sender}-${item.sequence}`,
    role: isSystem ? "system" : isUser ? "user" : "agent",
    content: item.content || item.message || item.text || "",
    sequence: item.sequence,
    created_at: item.created_at,
  };
};

const sortMessages = (items) =>
  [...items].sort((a, b) => {
    if (a.sequence !== undefined || b.sequence !== undefined) {
      return Number(a.sequence || 0) - Number(b.sequence || 0);
    }

    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });

const MessageSkeleton = ({ compact = false }) => (
  <div className="space-y-3" aria-hidden="true">
    {Array.from({ length: compact ? 2 : 5 }).map((_, index) => (
      <div
        key={index}
        className={cn(
          "flex animate-pulse",
          index % 2 ? "justify-end" : "justify-start",
        )}
      >
        <div
          className={cn(
            "h-12 rounded-2xl bg-slate-100",
            index % 2 ? "w-44 rounded-tr-md" : "w-56 rounded-tl-md",
          )}
        />
      </div>
    ))}
  </div>
);

const SystemMessageDivider = ({ message }) => (
  <div className="flex items-center gap-3 py-2">
    <span className="h-px flex-1 bg-slate-200" />
    <span className="max-w-[72%] rounded-full bg-white px-3 text-center text-[11px] font-semibold leading-5 text-slate-500">
      {message}
    </span>
    <span className="h-px flex-1 bg-slate-200" />
  </div>
);

const TripAgentChat = ({
  tripId,
  sessionId,
  messageUnreadCount = 0,
  notificationUnreadCount = 0,
  showTabs = true,
  activeSection = "chat",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const selectedSection = showTabs ? activeTab : activeSection;
  const tabs = useMemo(
    () =>
      asideTabs.map((tab) => {
        if (tab.value === "chat") {
          return { ...tab, unreadCount: messageUnreadCount };
        }
        if (tab.value === "notifications") {
          return { ...tab, unreadCount: notificationUnreadCount };
        }
        return tab;
      }),
    [messageUnreadCount, notificationUnreadCount],
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
        <ChatSection
          key={`${tripId || "trip"}-${sessionId || "session"}`}
          sessionId={sessionId}
          tripId={tripId}
        />
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
  const scrollContainerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const messagesEndRef = useRef(null);
  const preserveScrollRef = useRef(null);
  const hasScrolledInitialRef = useRef(false);
  const lastLoadedMessageRef = useRef(null);
  const {
    data: messageListData,
    isFetching: isFetchingMessages,
    isLoading: isLoadingMessages,
    isError: isMessageListError,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTripMessageInfiniteListInfiniteQuery(
    {
      trip_id: tripId,
      session_id: sessionId,
      page_size: MESSAGE_PAGE_SIZE,
    },
    { skip: !tripId || !sessionId },
  );
  const [createTripMessage, { isLoading: isSendingMessage }] =
    useCreateTripMessageMutation();
  const loadedPageCount = messageListData?.pages?.length || 0;
  const isInitialLoading =
    isLoadingMessages || (isFetchingMessages && !loadedPageCount);

  const messages = useMemo(() => {
    const messageMap = new Map();

    (messageListData?.pages || [])
      .slice()
      .reverse()
      .forEach((page, pageIndex) => {
        unwrapMessages(page).forEach((item, index) => {
          const normalizedMessage = normalizeMessage(item);
          messageMap.set(normalizedMessage.id || `${pageIndex}-${index}`, {
            ...normalizedMessage,
            id: normalizedMessage.id || `${pageIndex}-${index}`,
          });
        });
      });

    return sortMessages([...messageMap.values()]);
  }, [messageListData]);
  const renderedMessages = useMemo(
    () => (pendingMessage ? [...messages, pendingMessage] : messages),
    [messages, pendingMessage],
  );

  useEffect(() => {
    if (!scrollContainerRef.current || !preserveScrollRef.current) return;

    const container = scrollContainerRef.current;
    const previous = preserveScrollRef.current;
    const nextScrollHeight = container.scrollHeight;
    container.scrollTop = nextScrollHeight - previous.scrollHeight + previous.top;
    preserveScrollRef.current = null;
  }, [messages.length]);

  useEffect(() => {
    if (
      hasScrolledInitialRef.current ||
      isInitialLoading ||
      !renderedMessages.length
    ) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end" });
    hasScrolledInitialRef.current = true;
  }, [isInitialLoading, renderedMessages.length]);

  useEffect(() => {
    if (!pendingMessage) return;
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [pendingMessage]);

  useEffect(() => {
    const latestMessage = messages.at(-1);
    if (!latestMessage) return;

    const latestMessageSignature = `${latestMessage.id}-${latestMessage.content}`;
    const previousMessageSignature = lastLoadedMessageRef.current;
    lastLoadedMessageRef.current = latestMessageSignature;

    if (
      previousMessageSignature &&
      previousMessageSignature !== latestMessageSignature &&
      latestMessage.role === "agent"
    ) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;
    if (!container || !sentinel || !hasNextPage || isFetchingNextPage) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        preserveScrollRef.current = {
          top: container.scrollTop,
          scrollHeight: container.scrollHeight,
        };
        fetchNextPage();
      },
      { root: container, rootMargin: "160px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
        hasScrolledInitialRef.current = false;
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
      <div
        ref={scrollContainerRef}
        className="hidden-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pt-3"
      >
        <div ref={loadMoreRef} className="min-h-px" />
        {isFetchingNextPage && <MessageSkeleton compact />}
        {isInitialLoading ? (
          <MessageSkeleton />
        ) : isMessageListError ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            Could not load trip messages.
          </div>
        ) : renderedMessages.length ? (
          renderedMessages.map((message, index) => {
            if (message.role === "system") {
              return (
                <SystemMessageDivider
                  key={message.id || index}
                  message={message.content}
                />
              );
            }

            return message.role === "user" ? (
              <div
                key={message.id || index}
                className="max-w-[88%] w-fit overflow-hidden rounded-2xl px-4 py-3 text-sm leading-6 break-words whitespace-pre-wrap ml-auto rounded-tr-md bg-primary text-white"
              >
                {message.content}
              </div>
            ) : (
              <AuthorMessage
                key={message.id || index}
                message={message.content}
                renderHtml
              />
            );
          })
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
