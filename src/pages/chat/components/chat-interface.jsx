import React from "react";
import {
  ArrowUpRight,
  Loader2,
  Mountain,
  Search,
  Sparkles,
  Utensils,
  Waves,
  X,
} from "lucide-react";

import EmptyPage from "@/components/shared/empty-page";
import { AuthorMessage } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

import ChatHeader from "./chat-header";
import { MessageErrorState, MessageListSkeleton } from "./fallback";
import ChatInputForm from "./chat-input-form";
import MessageMetadata from "./message-metadata";
import { UserAvatar } from "@/components/shared/user-profile";

const suggestedPrompts = [
  {
    prompt: "Recommend a 5 day beach trip under $900",
    label: "Find a beach escape",
    icon: Waves,
  },
  {
    prompt: "Where should I go for mountain views in autumn?",
    label: "Explore the mountains",
    icon: Mountain,
  },
  {
    prompt: "Plan a relaxed food-focused weekend in Bangkok",
    label: "Plan a food weekend",
    icon: Utensils,
  },
];

const ChatWelcome = ({ isSendingMessage, onPromptClick }) => (
  <section className="hidden-scrollbar absolute inset-y-0 -left-4 -right-4 isolate flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-primary/10 via-white to-cyan-50 px-4 py-8 sm:px-8 md:-left-6 md:-right-6">
    <div
      className="absolute -left-16 top-10 size-48 rounded-full bg-cyan-600/10 blur-3xl"
      aria-hidden="true"
    />
    <div
      className="absolute -right-20 bottom-4 size-56 rounded-full bg-rose-200/30 blur-3xl"
      aria-hidden="true"
    />

    <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
      <img
        src="/logo.png"
        alt=""
        className="mx-auto size-12 object-contain sm:size-14"
      />

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        Where should we go next?
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
        Tell me what kind of trip you are imagining. I can compare places, shape
        an itinerary, or help with the practical details.
      </p>

      <div className="mt-7 grid gap-2 text-left sm:grid-cols-3">
        {suggestedPrompts.map(({ prompt, label, icon: PromptIcon }) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            disabled={isSendingMessage}
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 sm:flex-col sm:items-start sm:p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
              {React.createElement(PromptIcon, {
                className: "size-4",
                "aria-hidden": true,
              })}
            </span>
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:w-full">
              <span className="text-xs font-semibold leading-5 text-slate-700">
                {label}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-slate-300 transition group-hover:text-primary" />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
        Or type your own question below.
      </p>
    </div>
  </section>
);

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
  const destinationNamesById = new Map(
    messages.flatMap((item) =>
      (item.metadata?.destinations || [])
        .filter((destination) => destination.destination_id)
        .map((destination) => [destination.destination_id, destination.name]),
    ),
  );

  const handlePromptClick = (prompt) => {
    onSubmitMessage(prompt);
  };

  return (
    <Card
      className={cn(
        "h-full min-h-0 flex-col lg:flex",
        isMobileChatOpen
          ? "absolute inset-0 z-10 flex animate-in rounded-none slide-in-from-right duration-300 motion-reduce:animate-none lg:static lg:animate-none lg:rounded-3xl"
          : "hidden lg:flex",
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
        <>
          <div className="mt-3.5 flex flex-col gap-2 bg-white pb-3.5 sm:flex-row sm:items-center">
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
          <hr className="-mx-6 border-t border-slate-200" />
        </>
      )}

      <div
        className={cn(
          "relative min-h-0 flex-1",
          !isFetchingMessages && !isMessageListError && !messages.length
            ? "overflow-visible"
            : "hidden-scrollbar space-y-4 overflow-y-auto py-4 lg:space-y-5",
        )}
      >
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
                className={cn(
                  "flex items-start gap-2",
                  isUser && "justify-end",
                )}
              >
                {!isUser ? (
                  <div className="flex flex-col">
                    <AuthorMessage message={messageContent} />
                    <MessageMetadata
                      metadata={item.metadata}
                      handoffDestinationName={destinationNamesById.get(
                        item.metadata?.handoff?.destination_id,
                      )}
                    />
                  </div>
                ) : (
                  <div className="flex items-end gap-2 md:max-w-[82%] w-full justify-end">
                    <div className="rounded-xl rounded-br-none bg-primary px-3.5 py-2.5 text-white">
                      <p className="text-sm leading-6">{messageContent}</p>
                    </div>
                    <UserAvatar className="size-8" />
                  </div>
                )}
              </div>
            );
          })
        ) : debouncedMessageSearch ? (
          <EmptyPage
            icon={Search}
            eyebrow="No matching messages"
            title="No matching messages"
            description="Try a different search term or return to the full conversation."
            actionLabel="Clear search"
            onAction={onCloseMessageSearch}
            size="sm"
            className="hidden-scrollbar absolute inset-y-0 -left-4 -right-4 h-auto min-h-0 w-auto overflow-y-auto rounded-none py-8 sm:min-h-0 md:-left-6 md:-right-6"
          />
        ) : (
          <ChatWelcome
            isSendingMessage={isSendingMessage}
            onPromptClick={handlePromptClick}
          />
        )}
        {isSendingMessage && (
          <div className="flex items-center gap-2 pl-11 text-xs font-semibold text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            turtle is typing
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <hr className="-mx-6 border-t border-slate-200" />
      <div className="-mb-1.5 bg-white pt-2.5 lg:pt-3.5">
        <ChatInputForm
          composerRef={composerRef}
          message={message}
          onSubmitMessage={onSubmitMessage}
          onMessageChange={onMessageChange}
          isSendingMessage={isSendingMessage}
        />
      </div>
    </Card>
  );
};

export default ChatInterface;
