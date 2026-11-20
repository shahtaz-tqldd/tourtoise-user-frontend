import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import React from "react";

const ChatInputForm = ({
  composerRef,
  message,
  onSubmitMessage,
  onMessageChange,
  onFocus,
  isSendingMessage = false,
  className = "",
}) => {
  const canSend = message.trim().length > 0 && !isSendingMessage;

  const handleSendMessage = (event) => {
    event.preventDefault();
    onSubmitMessage(message);
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
    <form
      onSubmit={handleSendMessage}
      className={cn("flex items-end gap-2 sm:gap-3", className)}
    >
      <label htmlFor="agent-message" className="sr-only">
        Message Tour Agent
      </label>
      <textarea
        ref={composerRef}
        id="agent-message"
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        onFocus={onFocus}
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
  );
};

export default ChatInputForm;
