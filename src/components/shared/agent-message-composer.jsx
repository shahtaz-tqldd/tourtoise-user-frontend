import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";

import { AuthorMessage } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AgentMessageComposer = ({
  message,
  author = "turtle",
  placeholder = "Reply to the conversation",
  className = "",
}) => {
  const [input, setInput] = useState("");
  const inputId = useId();
  const navigate = useNavigate();
  const canSend = input.trim().length > 0;

  const startConversation = () => {
    const initialMessage = input.trim();
    if (!initialMessage) return;

    navigate("/agent-chat", {
      state: { initialMessage },
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    startConversation();
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing)
      return;

    event.preventDefault();
    startConversation();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <AuthorMessage
        message={message}
        author={author}
        className="!max-w-full"
      />
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <label htmlFor={inputId} className="sr-only">
          Message Tour Agent
        </label>
        <textarea
          id={inputId}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={!canSend}
          aria-label="Start a new agent conversation"
          className="mb-1 rounded-2xl"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default AgentMessageComposer;
