import React from "react";
import { Loader2, MessageSquareDot, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { EmptyState } from "@/components/shared/utils";
import { cn } from "@/lib/utils";

import { SessionErrorState, SessionListSkeleton } from "./fallback";

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
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
};

const sessionPreview = (session) =>
  session?.last_message?.content || "No messages yet";

const ChatSessionList = ({
  isMobileChatOpen,
  isCreatingSession,
  isFetchingSessions,
  isSessionListError,
  sessionSearch,
  sessions,
  selectedSessionId,
  onSessionSearchChange,
  onCreateSession,
  onSelectSession,
  onRetry,
}) => (
  <Card
    className={cn(
      "h-full min-h-0 rounded-none border-x-0 border-y-0 p-4 md:rounded-2xl md:border lg:flex lg:flex-col",
      isMobileChatOpen ? "hidden lg:flex" : "flex flex-col",
    )}
  >
    <div className="border-b border-slate-200 pb-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">Chat Sessions</h2>
          <p className="mt-1 text-xs text-slate-500">
            Pick up a previous travel chat
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          onClick={onCreateSession}
          disabled={isCreatingSession}
          aria-label="Create new session"
          className="rounded-full"
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
          onChange={(event) => onSessionSearchChange(event.target.value)}
          placeholder="Search sessions"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>

    <div className="custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto py-3 pr-1">
      {isFetchingSessions && !sessions.length ? (
        <SessionListSkeleton />
      ) : isSessionListError ? (
        <SessionErrorState onRetry={onRetry} />
      ) : sessions.length > 0 ? (
        sessions.map((session) => {
          const isActive = session.id === selectedSessionId;

          return (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session.id)}
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
                  <MessageSquareDot size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {session.title || "Untitled chat"}
                  </span>
                  <span className="mt-1 block truncate text-xs leading-5 text-slate-500">
                    {sessionPreview(session)}
                  </span>
                  <span className="mt-2 block text-[11px] font-semibold tracking-wide text-slate-400">
                    {formatRelativeTime(session.updated_at)}
                  </span>
                </span>
              </div>
            </button>
          );
        })
      ) : (
        <EmptyState
          title="No sessions found"
          description="Start a new session and adjust search"
          className="border-none"
        />
      )}
    </div>
  </Card>
);

export default ChatSessionList;
