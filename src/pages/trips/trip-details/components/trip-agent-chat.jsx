import React from "react";
import { MessageSquareDot, Plus, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const TripAgentChat = ({ messages = [] }) => (
  <aside className="lg:sticky lg:top-24 lg:self-start">
    <Card className="flex h-[calc(100vh-7rem)] min-h-[560px] flex-col">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareDot size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-950">
              Planning agent
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Continue adjusting route, documents, and daily details.
            </p>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length ? (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto rounded-tr-md bg-primary text-white"
                  : "rounded-tl-md bg-slate-100 text-slate-700"
              }`}
            >
              {message.content}
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
            No agent messages available yet.
          </p>
        )}
      </div>

      <form className="border-t border-slate-200 pt-4">
        <Textarea
          placeholder="Ask to adjust dates, route, documents, or packing..."
          className="min-h-24 resize-none rounded-xl border-slate-200 bg-slate-50 text-sm"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm">
            <Plus size={15} />
            Add context
          </Button>
          <Button type="submit" size="sm">
            <Send size={15} />
            Send
          </Button>
        </div>
      </form>
    </Card>
  </aside>
);

export default TripAgentChat;
