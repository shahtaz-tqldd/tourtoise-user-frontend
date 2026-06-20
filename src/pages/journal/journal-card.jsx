import React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, MoreVertical, Pencil, Trash2 } from "lucide-react";
import ReadJournalDialog from "./journal-dialog";

const JournalCard = ({ journal, isSaved = false, onSaveToggle }) => {
  const galleryImages = journal.images?.length
    ? journal.images
    : journal.cover_image
      ? [journal.cover_image]
      : [];

  return (
    <article className="md:rounded-[20px] md:border md:border-slate-200 md:bg-white md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row md:gap-8">
        {galleryImages[0] && (
          <img
            src={galleryImages[0]}
            alt=""
            className="aspect-[4/3] w-full rounded-2xl object-cover sm:h-44 sm:w-44 md:h-48 md:w-48"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span>{journal.date}</span>
              </div>

              <h3 className="mt-2 text-lg font-bold leading-snug text-slate-950">
                {journal.title}
              </h3>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {onSaveToggle && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-primary"
                  onClick={() => onSaveToggle(journal)}
                  aria-label={
                    isSaved ? "Remove saved journal" : "Save journal"
                  }
                  aria-pressed={isSaved}
                >
                  <Bookmark
                    size={16}
                    className={isSaved ? "fill-current" : ""}
                  />
                </Button>
              )}
              <JournalActions />
            </div>
          </div>

          <div className="flx mt-2 gap-2">
            <img
              src={journal.author.avatar_url}
              alt=""
              className="h-5 w-5 shrink-0 rounded-full object-cover"
            />
            <h2 className="truncate text-sm font-semibold text-slate-600">
              {journal.author.name}
            </h2>
          </div>
          <p className="mt-3 line-clamp-2 leading-7 text-slate-600">
            {journal.body}
          </p>

          <ReadJournalDialog journal={journal} images={galleryImages} />
        </div>
      </div>
    </article>
  );
};

const JournalActions = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="-mr-2 shrink-0 rounded-full text-slate-500"
        aria-label="Open journal actions"
      >
        <MoreVertical size={16} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-36">
      <DropdownMenuItem>
        <Pencil size={14} />
        Update
      </DropdownMenuItem>
      <DropdownMenuItem variant="destructive">
        <Trash2 size={14} />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default JournalCard;
