import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpRight,
  Bookmark,
  ChevronUp,
  MessageCircle,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import ReadJournalDialog from "./journal-dialog";
import JournalComments from "./journal-comments";

const JournalCard = ({
  journal,
  isSaved = false,
  onSaveToggle,
  onEdit,
  onDelete,
}) => {
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const galleryImages = journal.images?.length
    ? journal.images
    : journal.cover_image
      ? [journal.cover_image]
      : [];

  return (
    <article className="md:rounded-[20px] md:border md:border-slate-200 md:bg-white md:p-6">
      <div className="md:hidden">
        {galleryImages.length > 0 && (
          <Swiper
            modules={[Pagination]}
            pagination={
              galleryImages.length > 1
                ? { clickable: true, dynamicBullets: true }
                : false
            }
            className="journal-image-slider aspect-[4/3] w-full rounded-2xl overflow-hidden"
          >
            {galleryImages.map((image, index) => (
              <SwiperSlide key={`${image}-${index}`}>
                <img
                  src={image}
                  alt={`Journal photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={journal.author.avatar_url}
                alt={journal.author.name}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {journal.author.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{journal.date}</p>
              </div>
            </div>
            <JournalCardActions
              journal={journal}
              isSaved={isSaved}
              onSaveToggle={onSaveToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>

          <MobileStory
            content={journal.body}
            expanded={isStoryExpanded}
            onExpandedChange={setIsStoryExpanded}
          />
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
            onClick={() => setShowComments((show) => !show)}
            aria-expanded={showComments}
          >
            <MessageCircle size={15} className="text-primary" />
            {showComments ? "Hide Comments" : "Comments"}
            {journal.comments_count > 0 && ` (${journal.comments_count})`}
          </button>
          {showComments && (
            <div className="mt-5">
              <JournalComments journalId={journal.id} />
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <div
          className={`flex gap-8 ${galleryImages[0] ? "min-h-48" : ""}`}
        >
          {galleryImages[0] && (
            <img
              src={galleryImages[0]}
              alt=""
              className="h-48 w-48 shrink-0 rounded-2xl object-cover"
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flx gap-2">
                  <img
                    src={journal.author.avatar_url}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="truncate text-sm font-semibold text-slate-700">
                      {journal.author.name}
                    </h2>
                    <div className="mt-0.5 text-xs text-slate-500">
                      <span>{journal.date}</span>
                    </div>
                  </div>
                </div>
                <JournalCardActions
                  journal={journal}
                  isSaved={isSaved}
                  onSaveToggle={onSaveToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>

              <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                {journal.body}
              </p>
            </div>

            <div
              className={`flex items-center gap-5 ${
                galleryImages[0] ? "mt-auto" : ""
              }`}
            >
              <ReadJournalDialog journal={journal} images={galleryImages} />
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
                onClick={() => setShowComments((show) => !show)}
                aria-expanded={showComments}
              >
                <MessageCircle size={15} className="text-primary" />
                {showComments ? "Hide Comments" : "Comments"}
                {journal.comments_count > 0 && ` (${journal.comments_count})`}
              </button>
            </div>
          </div>
        </div>
        {showComments && (
          <div className="mt-6">
            <JournalComments journalId={journal.id} />
          </div>
        )}
      </div>
    </article>
  );
};

const MobileStory = ({ content, expanded, onExpandedChange }) => {
  const storyRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return undefined;

    const measureOverflow = () => {
      if (expanded) return;
      setIsOverflowing(story.scrollHeight > story.clientHeight + 1);
    };
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(story);
    requestAnimationFrame(measureOverflow);

    return () => observer.disconnect();
  }, [content, expanded]);

  return (
    <>
      <p
        ref={storyRef}
        className={`mt-3 whitespace-pre-line leading-7 text-slate-600 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {content}
      </p>
      {(isOverflowing || expanded) && (
        <button
          type="button"
          className="flx mt-3 gap-2 text-sm font-semibold text-primary"
          onClick={() => onExpandedChange(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronUp size={14} className="shrink-0" />
          ) : (
            <ArrowUpRight size={14} className="shrink-0" />
          )}
          <span>{expanded ? "Show Less" : "Read Full Story"}</span>
        </button>
      )}
    </>
  );
};

const JournalCardActions = ({
  journal,
  isSaved,
  onSaveToggle,
  onEdit,
  onDelete,
}) => (
  <div className="flex shrink-0 items-center gap-1">
    {onSaveToggle && (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-primary"
        onClick={() => onSaveToggle(journal)}
        aria-label={isSaved ? "Remove saved journal" : "Save journal"}
        aria-pressed={isSaved}
      >
        <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
      </Button>
    )}
    {(onEdit || onDelete) && (
      <JournalActions
        onEdit={() => onEdit?.(journal)}
        onDelete={() => onDelete?.(journal)}
      />
    )}
  </div>
);

const JournalActions = ({ onEdit, onDelete }) => (
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
      {onEdit && (
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil size={14} />
          Update
        </DropdownMenuItem>
      )}
      {onDelete && (
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default JournalCard;
