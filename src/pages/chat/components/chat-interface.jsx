import React from "react";
import { ChevronRight, Loader2, Search, Send, Sparkles, X } from "lucide-react";

import { AuthorMessage, EmptyState } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

import ChatHeader from "./chat-header";
import { MessageErrorState, MessageListSkeleton } from "./fallback";

const suggestedPrompts = [
  "Recommend a 5 day beach trip under $900",
  "Where should I go for mountain views in autumn?",
  "Plan a relaxed food-focused weekend in Bangkok",
  "What should I know before visiting Kyoto?",
];

const highlightMessageMatch = (message, query) => {
  if (!query) return message;

  const source = String(message || "");
  const normalizedSource = source.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const parts = [];
  let cursor = 0;
  let matchIndex = normalizedSource.indexOf(normalizedQuery);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push(source.slice(cursor, matchIndex));
    }

    const matchEnd = matchIndex + query.length;
    parts.push(
      <mark
        key={`${matchIndex}-${matchEnd}`}
        className="rounded bg-amber-200 px-0.5 text-inherit"
      >
        {source.slice(matchIndex, matchEnd)}
      </mark>,
    );
    cursor = matchEnd;
    matchIndex = normalizedSource.indexOf(normalizedQuery, cursor);
  }

  if (cursor < source.length) {
    parts.push(source.slice(cursor));
  }

  return parts;
};

const ChatInterface = ({
  activeSession,
  composerRef,
  debouncedMessageSearch,
  hasMessages,
  isDeletingSession,
  isFetchingMessages,
  isMessageListError,
  isMessageSearchOpen,
  isMobileChatOpen,
  isSendingMessage,
  message,
  messageResultCount,
  messageSearch,
  messageSearchInputRef,
  messages,
  messagesEndRef,
  selectedSessionId,
  trimmedMessageSearch,
  onBack,
  onCloseMessageSearch,
  onDeleteSession,
  onDownloadSession,
  onMessageChange,
  onMessageSearchChange,
  onOpenMessageSearch,
  onRefetchMessages,
  onSubmitMessage,
}) => {
  const canSend = message.trim().length > 0 && !isSendingMessage;

  const handleSendMessage = (event) => {
    event.preventDefault();
    onSubmitMessage(message);
  };

  const handlePromptClick = (prompt) => {
    onSubmitMessage(prompt);
  };

  const handleComposerKeyDown = (event) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;

    event.preventDefault();
    onSubmitMessage(message);
  };

  return (
    <Card
      className={cn(
        "h-full min-h-0 rounded-none border-x-0 border-y-0 p-4 md:rounded-2xl md:border lg:flex lg:flex-col",
        isMobileChatOpen ? "flex flex-col" : "hidden lg:flex",
      )}
    >
      <ChatHeader
        activeSession={activeSession}
        hasMessages={hasMessages}
        isDeletingSession={isDeletingSession}
        onBack={onBack}
        onOpenSearch={onOpenMessageSearch}
        onDownload={onDownloadSession}
        onDelete={onDeleteSession}
      />

      {isMessageSearchOpen && (
        <div className="mt-4 flex flex-col gap-2 border-b border-slate-200 bg-white pb-4 sm:flex-row sm:items-center">
          <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search size={16} className="shrink-0" />
            <label htmlFor="message-search" className="sr-only">
              Search messages
            </label>
            <input
              ref={messageSearchInputRef}
              id="message-search"
              value={messageSearch}
              onChange={(event) => onMessageSearchChange(event.target.value)}
              placeholder="Search messages"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <span className="text-xs font-semibold text-slate-500">
              {trimmedMessageSearch
                ? isFetchingMessages
                  ? "Searching..."
                  : `${messageResultCount} result${
                      messageResultCount === 1 ? "" : "s"
                    }`
                : `${messages.length} messages`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCloseMessageSearch}
              aria-label="Close message search"
              className="rounded-full"
            >
              <X size={17} />
            </Button>
          </div>
        </div>
      )}

      <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto py-4 pr-1 lg:space-y-5 lg:pr-2">
        {isFetchingMessages && selectedSessionId && !messages.length ? (
          <MessageListSkeleton />
        ) : isMessageListError ? (
          <MessageErrorState onRetry={onRefetchMessages} />
        ) : messages.length > 0 ? (
          messages.map((item) => {
            const isUser = item.role === "user";
            const messageContent = highlightMessageMatch(
              item.message,
              trimmedMessageSearch,
            );

            return (
              <div
                key={item.id}
                className={cn("flex items-start gap-2", isUser && "justify-end")}
              >
                {!isUser ? (
                  <AuthorMessage message={messageContent} />
                ) : (
                  <div className="max-w-[82%] rounded-xl rounded-tr-md bg-primary px-4 py-3 text-white sm:max-w-[78%] md:max-w-[72%]">
                    <p className="text-sm leading-6">{messageContent}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : debouncedMessageSearch ? (
          <EmptyState
            title="No matching messages"
            description="Try a different search term"
            className="border-none"
          />
        ) : (
          <div className="flex h-[calc(100%-20px)] flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles size={24} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-950">
              Start Conversation
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ask for destination recommendations, route comparisons, weather
              notes, local etiquette, budgets, or a day-by-day plan.
            </p>
            <div className="mt-5 flex flex-col items-start gap-2">
              {suggestedPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isSendingMessage}
                  className="flex gap-2 rounded-md border border-slate-200 bg-white py-2.5 pl-2 pr-3 text-xs font-semibold text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronRight size={14} />
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

      <div className="border-t border-slate-200 bg-white pt-3 lg:pt-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
          <label htmlFor="agent-message" className="sr-only">
            Message Tour Agent
          </label>
          <textarea
            ref={composerRef}
            id="agent-message"
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Message turtle..."
            rows={1}
            readOnly={isSendingMessage}
            aria-disabled={isSendingMessage}
            className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 sm:min-h-12 sm:py-3"
          />
          <Button
            type="submit"
            size="icon-lg"
            disabled={!canSend}
            aria-label="Send message"
            className="mb-1 rounded-full"
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
  );
};

export default ChatInterface;
