import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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

const suggestedPrompts = [
  "Recommend a 5 day beach trip under $900",
  "Where should I go for mountain views in autumn?",
  "Plan a relaxed food-focused weekend in Bangkok",
  "What should I know before visiting Kyoto?",
];

const starterMessages = [
  {
    id: 1,
    role: "assistant",
    message:
      "Hi, I am your Tour Agent. Tell me where you are starting from, your dates, budget, pace, and what kind of places you like. I can recommend destinations, compare routes, and turn the plan into a practical itinerary.",
    meta: "turtle",
  },
  {
    id: 2,
    role: "user",
    message:
      "I want a peaceful destination with nature, good local food, and not too much crowd.",
    meta: "You",
  },
  {
    id: 3,
    role: "assistant",
    message:
      "For that style, I would shortlist Luang Prabang, Pokhara, and Ninh Binh. They all work well for slower days, scenic viewpoints, local markets, and flexible budgets. Share your travel month and departure city and I can narrow it down.",
    meta: "turtle",
  },
];

const initialSessions = [
  {
    id: "session-1",
    title: "Peaceful nature escape",
    preview: "Shortlist Luang Prabang, Pokhara, and Ninh Binh.",
    updatedAt: "Just now",
    messages: starterMessages,
  },
  {
    id: "session-2",
    title: "Japan spring route",
    preview: "Kyoto, Kanazawa, and Takayama with slower travel days.",
    updatedAt: "Yesterday",
    messages: [],
  },
];

const localAssistantReply =
  "Got it. I would compare destinations by travel time, seasonal weather, daily budget, crowd level, and the kind of experiences you want. Add your travel month, starting city, group size, and budget range so I can make a sharper recommendation.";

const createForwardedSession = (message) => ({
  id: "forwarded-session",
  title: message.slice(0, 42),
  preview: message,
  updatedAt: "Just now",
  messages: [
    {
      id: 4,
      role: "user",
      message,
      meta: "You",
    },
    {
      id: 5,
      role: "assistant",
      message: localAssistantReply,
      meta: "turtle",
    },
  ],
});

const AgentChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage =
    typeof location.state?.initialMessage === "string"
      ? location.state.initialMessage.trim()
      : "";
  const [sessions, setSessions] = useState(() =>
    initialMessage
      ? [createForwardedSession(initialMessage), ...initialSessions]
      : initialSessions,
  );
  const [activeSessionId, setActiveSessionId] = useState(() =>
    initialMessage ? "forwarded-session" : initialSessions[0]?.id,
  );
  const [sessionSearch, setSessionSearch] = useState("");
  const [message, setMessage] = useState("");
  const nextSessionIdRef = useRef(3);
  const nextMessageIdRef = useRef(initialMessage ? 6 : 4);
  const messagesEndRef = useRef(null);

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );
  const messages = activeSession?.messages || [];
  const canSend = message.trim().length > 0;

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) =>
        `${session.title} ${session.preview}`
          .toLowerCase()
          .includes(sessionSearch.trim().toLowerCase()),
      ),
    [sessionSearch, sessions],
  );

  const createNewSession = () => {
    const newSession = {
      id: `session-${nextSessionIdRef.current}`,
      title: "New travel chat",
      preview: "No messages yet",
      updatedAt: "New",
      messages: [],
    };

    nextSessionIdRef.current += 1;
    setSessions((currentSessions) => [newSession, ...currentSessions]);
    setActiveSessionId(newSession.id);
    setMessage("");
  };

  const deleteActiveSession = () => {
    if (!activeSessionId) return;

    setSessions((currentSessions) => {
      const nextSessions = currentSessions.filter(
        (session) => session.id !== activeSessionId,
      );

      setActiveSessionId(nextSessions[0]?.id);
      return nextSessions;
    });
    setMessage("");
  };

  const downloadActiveSession = () => {
    if (!activeSession) return;

    const sessionLines = [
      activeSession.title,
      "",
      ...activeSession.messages.map((item) => `${item.meta}: ${item.message}`),
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

  const submitMessage = (nextMessage) => {
    const trimmedMessage = nextMessage.trim();
    if (!trimmedMessage) return;

    const userMessage = {
      id: nextMessageIdRef.current,
      role: "user",
      message: trimmedMessage,
      meta: "You",
    };
    nextMessageIdRef.current += 1;

    const assistantMessage = {
      id: nextMessageIdRef.current,
      role: "assistant",
      message: localAssistantReply,
      meta: "turtle",
    };
    nextMessageIdRef.current += 1;

    if (!activeSessionId) {
      const firstSession = {
        id: `session-${nextSessionIdRef.current}`,
        title: trimmedMessage.slice(0, 42),
        preview: trimmedMessage,
        updatedAt: "Just now",
        messages: [userMessage, assistantMessage],
      };

      nextSessionIdRef.current += 1;
      setSessions([firstSession]);
      setActiveSessionId(firstSession.id);
      setMessage("");
      return;
    }

    setSessions((currentSessions) => {
      return currentSessions.map((session) => {
        if (session.id !== activeSessionId) return session;

        const nextMessages = [
          ...session.messages,
          userMessage,
          assistantMessage,
        ];

        return {
          ...session,
          title:
            session.messages.length === 0
              ? trimmedMessage.slice(0, 42)
              : session.title,
          preview: trimmedMessage,
          updatedAt: "Just now",
          messages: nextMessages,
        };
      });
    });

    setMessage("");
  };

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
    if (!initialMessage) return;

    navigate(location.pathname, { replace: true, state: null });
  }, [initialMessage, location.pathname, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, activeSessionId]);

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
              aria-label="Create new session"
              className="rounded-xl"
            >
              <Plus size={18} />
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
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;

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
                        {session.title}
                      </span>
                      <span className="mt-1 truncate block text-xs leading-5 text-slate-500">
                        {session.preview}
                      </span>
                      <span className="mt-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {session.updatedAt}
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
                disabled={!activeSession}
                className="cursor-pointer rounded-lg"
              >
                <Download size={16} />
                Download session
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={deleteActiveSession}
                disabled={!activeSession}
                className="cursor-pointer rounded-lg"
              >
                <Trash2 size={16} />
                Delete session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto rounded-2xl bg-slate-50/70 px-4 py-5">
          {messages.length > 0 ? (
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
                    <div
                      className={cn(
                        "max-w-[86%] rounded-xl px-4 py-3 md:max-w-[72%]",
                        isUser
                          ? "rounded-tr-md bg-primary text-white"
                          : "rounded-tl-md border border-slate-200 bg-white text-slate-700",
                      )}
                    >
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
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
              className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
            <Button
              type="submit"
              size="icon-lg"
              disabled={!canSend}
              aria-label="Send message"
              className="mb-1 rounded-2xl"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
};

export default AgentChatPage;
