import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bookmark,
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
import { cn } from "@/lib/utils";

const JournalCard = ({
  journal,
  isSaved = false,
  onSaveToggle,
  onEdit,
  onDelete,
}) => {
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const authorName = journal.author?.name || "Unknown traveler";
  const authorAvatar = journal.author?.avatar_url;
  const galleryImages = journal.images?.length
    ? journal.images
    : journal.cover_image
      ? [journal.cover_image]
      : [];

  return (
    <article className="border-b border-slate-200 md:rounded-[20px] md:border md:border-slate-200 md:bg-white -mx-4 md:mx-0 px-4 md:px-4 py-3 md:py-4">
      <div className="md:hidden">
        {galleryImages.length > 0 && (
          <Swiper
            modules={[Pagination]}
            pagination={
              galleryImages.length > 1
                ? { clickable: true, dynamicBullets: true }
                : false
            }
            className="journal-image-slider aspect-[4/3] w-full overflow-hidden rounded-2xl"
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

        <div className={cn(galleryImages.length > 0 ? "pt-4" : "")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <AuthorAvatar src={authorAvatar} name={authorName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {authorName}
                </p>
                {journal.date && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {journal.date}
                  </p>
                )}
              </div>
            </div>
            <JournalOwnerActions
              onEdit={onEdit ? () => onEdit(journal) : undefined}
              onDelete={onDelete ? () => onDelete(journal) : undefined}
            />
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <MobileStory
                content={journal.body}
                expanded={isStoryExpanded}
                onExpandedChange={setIsStoryExpanded}
              />
              <CommentToggle
                showComments={showComments}
                commentsCount={journal.comments_count}
                onToggle={() => setShowComments((show) => !show)}
                className="mt-3"
              />
            </div>
            <JournalSaveButton
              journal={journal}
              isSaved={isSaved}
              onSaveToggle={onSaveToggle}
              className="mb-0.5"
            />
          </div>

          {showComments && (
            <div className="mt-5">
              <JournalComments journalId={journal.id} />
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <div className={`flex gap-8 ${galleryImages[0] ? "min-h-48" : ""}`}>
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
                <div className="flex min-w-0 gap-2">
                  <AuthorAvatar src={authorAvatar} name={authorName} />
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-slate-700">
                      {authorName}
                    </h2>
                    {journal.date && (
                      <div className="mt-0.5 text-xs text-slate-500">
                        <span>{journal.date}</span>
                      </div>
                    )}
                  </div>
                </div>
                <JournalOwnerActions
                  onEdit={onEdit ? () => onEdit(journal) : undefined}
                  onDelete={onDelete ? () => onDelete(journal) : undefined}
                />
              </div>

              <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                {journal.body}
              </p>
            </div>

            <div
              className={`flex items-center justify-between gap-5 ${
                galleryImages[0] ? "mt-auto" : "mt-4"
              }`}
            >
              <div className="flex min-w-0 items-center gap-5">
                <ReadJournalDialog journal={journal} images={galleryImages} />
                <CommentToggle
                  showComments={showComments}
                  commentsCount={journal.comments_count}
                  onToggle={() => setShowComments((show) => !show)}
                />
              </div>
              <JournalSaveButton
                journal={journal}
                isSaved={isSaved}
                onSaveToggle={onSaveToggle}
              />
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

const AuthorAvatar = ({ src, name, size = "sm" }) => (
  <div
    className={`shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary ${
      size === "md" ? "h-9 w-9" : "h-8 w-8"
    }`}
  >
    {src ? (
      <img src={src} alt={name} className="h-full w-full object-cover" />
    ) : (
      <span className="center h-full text-xs font-bold">
        {name?.charAt(0).toUpperCase() || "T"}
      </span>
    )}
  </div>
);

const CommentToggle = ({
  showComments,
  commentsCount,
  onToggle,
  className = "",
}) => (
  <button
    type="button"
    className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-600 ${className}`}
    onClick={onToggle}
    aria-expanded={showComments}
  >
    <MessageCircle size={15} className="text-primary" />
    {showComments ? "Hide Comments" : "Comments"}
    {commentsCount > 0 && ` (${commentsCount})`}
  </button>
);

const JournalSaveButton = ({
  journal,
  isSaved,
  onSaveToggle,
  className = "",
}) => {
  if (!onSaveToggle) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={`shrink-0 rounded-full text-primary ${className}`}
      onClick={() => onSaveToggle(journal)}
      aria-label={isSaved ? "Remove saved journal" : "Save journal"}
      aria-pressed={isSaved}
    >
      <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
    </Button>
  );
};

const JournalOwnerActions = ({ onEdit, onDelete }) => {
  if (!onEdit && !onDelete) return null;

  return <JournalActions onEdit={onEdit} onDelete={onDelete} />;
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
      <div className="relative mt-3">
        <p
          ref={storyRef}
          className={`whitespace-pre-line leading-7 text-slate-600 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {content}
          {expanded && (
            <button
              type="button"
              className="ml-1 inline text-sm font-semibold text-primary"
              onClick={() => onExpandedChange(false)}
              aria-expanded={expanded}
            >
              ... Show less
            </button>
          )}
        </p>
        {isOverflowing && !expanded && (
          <button
            type="button"
            className="absolute bottom-1 right-0 translate-x-5 text-sm font-semibold text-primary"
            onClick={() => onExpandedChange(true)}
            aria-expanded={expanded}
          >
            Read more
          </button>
        )}
      </div>
    </>
  );
};

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
