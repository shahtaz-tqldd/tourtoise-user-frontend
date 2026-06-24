import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Download,
  Loader2,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Card from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthorMessage } from "@/components/shared/utils";
import useDebounce from "@/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  useAskChatQuestionMutation,
  useChatMessageListQuery,
  useChatSessionListQuery,
  useCreateChatSessionMutation,
  useDeleteChatSessionMutation,
} from "@/features/chat/chatApiSlice";

const suggestedPrompts = [
  "Recommend a 5 day beach trip under $900",
  "Where should I go for mountain views in autumn?",
  "Plan a relaxed food-focused weekend in Bangkok",
  "What should I know before visiting Kyoto?",
];

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "New";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "New";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
};

const sessionPreview = (session) =>
  session?.last_message?.content || "No messages yet";

const toDisplayMessage = (message) => ({
  id: message.id,
  role: message.sender === "user" ? "user" : "assistant",
  message: message.content,
  meta: message.sender === "user" ? "You" : "turtle",
  created_at: message.created_at,
});

const AgentChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage =
    typeof location.state?.initialMessage === "string"
      ? location.state.initialMessage.trim()
      : "";
  const forwardedMessageSentRef = useRef(false);
  const messagesEndRef = useRef(null);
  const pendingMessageIdRef = useRef(1);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState(null);
  const debouncedSessionSearch = useDebounce(sessionSearch.trim(), 350);

  const {
    data: sessionListResponse,
    isFetching: isFetchingSessions,
    isError: isSessionListError,
    refetch: refetchSessions,
  } = useChatSessionListQuery({
    page: 1,
    page_size: 20,
    search: debouncedSessionSearch,
  });

  const sessions = useMemo(
    () => sessionListResponse?.data || [],
    [sessionListResponse?.data],
  );
  const selectedSessionId = useMemo(() => {
    if (sessions.some((session) => session.id === activeSessionId)) {
      return activeSessionId;
    }

    return sessions[0]?.id || null;
  }, [activeSessionId, sessions]);
  const activeSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );

  const {
    data: messageListResponse,
    isFetching: isFetchingMessages,
    isError: isMessageListError,
    refetch: refetchMessages,
  } = useChatMessageListQuery(
    {
      session_id: selectedSessionId,
      page: 1,
      page_size: 100,
    },
    { skip: !selectedSessionId },
  );

  const [createChatSession, { isLoading: isCreatingSession }] =
    useCreateChatSessionMutation();
  const [deleteChatSession, { isLoading: isDeletingSession }] =
    useDeleteChatSessionMutation();
  const [askChatQuestion, { isLoading: isSendingMessage }] =
    useAskChatQuestionMutation();

  const messages = useMemo(() => {
    const serverMessages = (messageListResponse?.data || [])
      .slice()
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .map(toDisplayMessage);

    if (!pendingMessage) return serverMessages;
    return [...serverMessages, pendingMessage];
  }, [messageListResponse?.data, pendingMessage]);

  const canSend = message.trim().length > 0 && !isSendingMessage;

  const createNewSession = async () => {
    try {
      const response = await createChatSession({
        title: "New travel chat",
      }).unwrap();
      const session = response?.data;

      if (session?.id) setActiveSessionId(session.id);
      setMessage("");
      toast.success(response?.message || "Chat session created.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create chat session."));
    }
  };

  const deleteActiveSession = async () => {
    if (!selectedSessionId) return;

    try {
      const deletingId = selectedSessionId;
      const response = await deleteChatSession(deletingId).unwrap();
      const nextSession = sessions.find((session) => session.id !== deletingId);

      setActiveSessionId(nextSession?.id || null);
      setMessage("");
      toast.success(response?.message || "Chat session deleted.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this session."));
    }
  };

  const downloadActiveSession = () => {
    if (!activeSession) return;

    const sessionLines = [
      activeSession.title,
      "",
      ...messages.map((item) => `${item.meta}: ${item.message}`),
    ];
    const file = new Blob([sessionLines.join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      activeSession.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "travel-chat-session"
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitMessage = useCallback(async (nextMessage) => {
    const trimmedMessage = nextMessage.trim();
    if (!trimmedMessage || isSendingMessage) return;

    setMessage("");
    setPendingMessage({
      id: `pending-${pendingMessageIdRef.current}`,
      role: "user",
      message: trimmedMessage,
      meta: "You",
    });
    pendingMessageIdRef.current += 1;

    try {
      const payload = selectedSessionId
        ? { session_id: selectedSessionId, message: trimmedMessage }
        : { message: trimmedMessage };
      const response = await askChatQuestion(payload).unwrap();
      const sessionId = response?.data?.session_id;

      if (sessionId) setActiveSessionId(sessionId);
    } catch (error) {
      setMessage(trimmedMessage);
      toast.error(getApiErrorMessage(error, "Could not send message."));
    } finally {
      setPendingMessage(null);
    }
  }, [askChatQuestion, isSendingMessage, selectedSessionId]);

  const sendMessage = (event) => {
    event.preventDefault();
    submitMessage(message);
  };

  const sendPrompt = (prompt) => {
    submitMessage(prompt);
  };

  const handleComposerKeyDown = (event) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;

    event.preventDefault();
    submitMessage(message);
  };

  useEffect(() => {
    if (!initialMessage || forwardedMessageSentRef.current) return;

    forwardedMessageSentRef.current = true;
    submitMessage(initialMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [initialMessage, location.pathname, navigate, submitMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selectedSessionId]);

  return (
    <section className="mt-4 grid gap-5 lg:h-[calc(100vh-100px)] lg:min-h-[560px] lg:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="flex min-h-[420px] flex-col lg:min-h-0">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Sessions</h2>
              <p className="text-sm text-slate-500">
                Pick up a previous travel chat.
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              onClick={createNewSession}
              disabled={isCreatingSession}
              aria-label="Create new session"
              className="rounded-xl"
            >
              {isCreatingSession ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            <Search size={16} className="shrink-0" />
            <input
              value={sessionSearch}
              onChange={(event) => setSessionSearch(event.target.value)}
              placeholder="Search sessions"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-2 py-3 pr-1">
          {isFetchingSessions && !sessions.length ? (
            <SessionListSkeleton />
          ) : isSessionListError ? (
            <SessionErrorState onRetry={refetchSessions} />
          ) : sessions.length > 0 ? (
            sessions.map((session) => {
              const isActive = session.id === selectedSessionId;

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setMessage("");
                  }}
                  className={cn(
                    "w-full rounded-xl p-3 text-left transition",
                    isActive ? "bg-primary/10" : "hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        isActive
                          ? "bg-white text-primary"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      <MessageCircle size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-950">
                        {session.title || "Untitled chat"}
                      </span>
                      <span className="mt-1 block truncate text-xs leading-5 text-slate-500">
                        {sessionPreview(session)}
                      </span>
                      <span className="mt-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {formatRelativeTime(session.updated_at)}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <MessageCircle size={20} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-950">
                No sessions found
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Start a new session or adjust the search term.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={createNewSession}
                disabled={isCreatingSession}
                className="mt-4"
              >
                <Plus size={16} />
                New session
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="flex min-h-[620px] flex-col lg:min-h-0">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-white pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                {activeSession?.title || "Travel recommendation chat"}
              </h2>
              <p className="text-sm text-slate-500">
                Share constraints, compare places, and refine your route.
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Session options"
                className="rounded-xl"
              >
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={downloadActiveSession}
                disabled={!activeSession || !messages.length}
                className="cursor-pointer rounded-lg"
              >
                <Download size={16} />
                Download session
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={deleteActiveSession}
                disabled={!activeSession || isDeletingSession}
                className="cursor-pointer rounded-lg"
              >
                <Trash2 size={16} />
                Delete session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto rounded-2xl bg-slate-50/70 px-4 py-5">
          {isFetchingMessages && selectedSessionId && !messages.length ? (
            <MessageListSkeleton />
          ) : isMessageListError ? (
            <MessageErrorState onRetry={refetchMessages} />
          ) : messages.length > 0 ? (
            messages.map((item) => {
              const isUser = item.role === "user";

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-2",
                    isUser && "justify-end",
                  )}
                >
                  {!isUser ? (
                    <AuthorMessage message={item.message} />
                  ) : (
                    <div className="max-w-[86%] rounded-xl rounded-tr-md bg-primary px-4 py-3 text-white md:max-w-[72%]">
                      <p className="text-sm leading-6">{item.message}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={24} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Start a travel conversation
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Ask for destination recommendations, route comparisons, weather
                notes, local etiquette, budgets, or a day-by-day plan.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {suggestedPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    disabled={isSendingMessage}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isSendingMessage && (
            <div className="flex items-center gap-2 pl-11 text-xs font-semibold text-slate-400">
              <Loader2 size={14} className="animate-spin" />
              turtle is typing
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200 bg-white pt-4">
          <form onSubmit={sendMessage} className="flex items-end gap-3">
            <label htmlFor="agent-message" className="sr-only">
              Message Tour Agent
            </label>
            <textarea
              id="agent-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask about destinations, weather, culture, budget, safety, food, or a custom route..."
              rows={2}
              disabled={isSendingMessage}
              className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
            />
            <Button
              type="submit"
              size="icon-lg"
              disabled={!canSend}
              aria-label="Send message"
              className="mb-1 rounded-2xl"
            >
              {isSendingMessage ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
};

const SessionListSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((item) => (
      <div key={item} className="flex gap-3 rounded-xl p-3">
        <div className="size-9 animate-pulse rounded-lg bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const MessageListSkeleton = () => (
  <div className="space-y-5">
    <div className="h-20 w-3/4 animate-pulse rounded-xl bg-slate-100" />
    <div className="ml-auto h-16 w-2/3 animate-pulse rounded-xl bg-slate-200" />
    <div className="h-24 w-4/5 animate-pulse rounded-xl bg-slate-100" />
  </div>
);

const SessionErrorState = ({ onRetry }) => (
  <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center">
    <h3 className="text-sm font-bold text-red-950">Could not load sessions</h3>
    <p className="mt-1 text-sm leading-6 text-red-700">
      Check your connection and try again.
    </p>
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onRetry}
      className="mt-4"
    >
      Retry
    </Button>
  </div>
);

const MessageErrorState = ({ onRetry }) => (
  <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-white p-8 text-center">
    <h3 className="text-lg font-bold text-red-950">Could not load messages</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-red-700">
      The selected chat failed to load.
    </p>
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onRetry}
      className="mt-4"
    >
      Retry
    </Button>
  </div>
);

export default AgentChatPage;
