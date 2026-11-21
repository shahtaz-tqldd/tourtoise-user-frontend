import { useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, ChevronUp, Info, Minus, Plus, Repeat, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { StepLog } from "./agent-veil";
import { AgentAvatar } from "./planner-ui";

const SUGGESTIONS = {
  setup: ["More relaxed this time", "Keep it budget-friendly", "Add a day"],
  discover: ["Add paragliding", "Skip the zipline", "I want a slower trip"],
  itinerary: ["Make it more relaxed", "Remove the museum", "Add a day", "Make it cheaper"],
  budget: ["Make it cheaper", "Premium stay", "Remove paragliding"],
  pack: ["What's the weather like?"],
};

const TONE = {
  add: { icon: Plus, cls: "bg-success-soft text-success" },
  remove: { icon: Minus, cls: "bg-danger-soft text-danger" },
  swap: { icon: Repeat, cls: "bg-info-soft text-info" },
  save: { icon: TrendingDown, cls: "bg-success-soft text-success" },
  info: { icon: Info, cls: "bg-surface-muted text-body" },
};

const Message = ({ msg }) =>
  msg.role === "user" ? (
    <li className="pl-rise flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3 py-1.5 text-caption text-white">{msg.text}</p>
    </li>
  ) : (
    <li className="pl-rise flex gap-2">
      <AgentAvatar size="xs" className="mt-0.5" />
      <div className="min-w-0 max-w-[88%] rounded-2xl rounded-tl-md bg-surface-subtle px-3 py-2">
        <p className="text-caption text-heading">{msg.text}</p>
        {msg.changes?.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {msg.changes.map((c, i) => {
              const { icon: Icon, cls } = TONE[c.tone] || TONE.info;
              return (
                <li key={i} className="pl-drop flex items-center gap-1.5 text-2xs text-body" style={{ animationDelay: `${i * 110}ms` }}>
                  <span className={cn("center size-4 shrink-0 rounded-full", cls)}>
                    <Icon className="size-2.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {c.text}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </li>
  );

/** Pinned to the bottom of the control panel: ask Turtle to adjust anything. */
const ChatBox = ({ stage, messages, chatBusy, onAsk, disabled }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatBusy, open]);

  const send = (value) => {
    if (!value.trim() || disabled) return;
    setOpen(true);
    onAsk(value);
    setText("");
  };

  const hasThread = messages.length > 0 || chatBusy;

  return (
    <div className="border-t border-line-subtle bg-surface">
      {hasThread && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 pt-2.5 text-2xs font-semibold text-subtle hover:text-heading"
          aria-expanded={open}
        >
          Chat with Turtle · {messages.length}
          {open ? <ChevronDown className="size-3.5" aria-hidden="true" /> : <ChevronUp className="size-3.5" aria-hidden="true" />}
        </button>
      )}
      {hasThread && open && (
        <ul ref={listRef} className="max-h-44 space-y-2 overflow-y-auto px-4 py-2">
          {messages.map((m) => (
            <Message key={m.id} msg={m} />
          ))}
          {chatBusy && (
            <li className="flex gap-2">
              <AgentAvatar size="xs" thinking className="mt-0.5" />
              <div className="rounded-2xl rounded-tl-md bg-accent px-3 py-2">
                <StepLog steps={chatBusy.steps} compact />
              </div>
            </li>
          )}
        </ul>
      )}

      <div className="hidden-scrollbar flex gap-1.5 overflow-x-auto px-3 pt-2.5">
        {(SUGGESTIONS[stage] || []).map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => send(s)}
            className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-2xs font-semibold text-brand-text transition hover:bg-brand-100 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="flex items-center gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={chatBusy ? "Turtle is on it…" : "Ask Turtle to adjust budget, pace, places…"}
          disabled={disabled}
          aria-label="Ask Turtle"
          className="h-10 min-w-0 flex-1 rounded-control border border-line bg-surface px-3 text-body-sm text-heading outline-none transition placeholder:text-faint focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="center size-10 shrink-0 rounded-control bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
          aria-label="Send"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
