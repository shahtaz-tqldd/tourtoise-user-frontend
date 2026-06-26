import React from "react";
import {
  ArrowLeft,
  Download,
  MoreVertical,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatHeader = ({
  activeSession,
  hasMessages,
  isDeletingSession,
  onBack,
  onOpenSearch,
  onDownload,
  onDelete,
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white pb-3 lg:pb-4">
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onBack}
        aria-label="Back to chat sessions"
        className="-ml-2 rounded-full lg:hidden"
      >
        <ArrowLeft size={19} />
      </Button>
      <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary md:flex sm:size-11">
        <Sparkles size={20} />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-bold text-slate-950 sm:text-md">
          {activeSession?.title || "Travel recommendation chat"}
        </h2>
        <p className="mt-1 truncate text-xs text-slate-500">
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
          className="rounded-full"
        >
          <MoreVertical size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuItem
          onClick={onOpenSearch}
          disabled={!activeSession || !hasMessages}
          className="cursor-pointer rounded-lg"
        >
          <Search size={16} />
          Search Message
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDownload}
          disabled={!activeSession || !hasMessages}
          className="cursor-pointer rounded-lg"
        >
          <Download size={16} />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={onDelete}
          disabled={!activeSession || isDeletingSession}
          className="cursor-pointer rounded-lg"
        >
          <Trash2 size={16} />
          Delete session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default ChatHeader;
