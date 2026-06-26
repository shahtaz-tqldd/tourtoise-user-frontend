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
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import JournalComments from "./comments";
import Card from "@/components/ui/card";

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
    <Card className="p-0 bg-transparent md:bg-white md:p-6 rounded-none md:rounded-3xl">
      <div>
        <div>
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
          {galleryImages.length > 0 && (
            <Swiper
              modules={[Pagination]}
              pagination={
                galleryImages.length > 1
                  ? { clickable: true, dynamicBullets: true }
                  : false
              }
              className="mt-4 mb-2 journal-image-slider aspect-[16/9] w-full overflow-hidden rounded-2xl"
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
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <JournalStory
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
    </Card>
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
    className={`flx gap-2 text-sm font-semibold text-slate-600 py-2 px-3 bg-white md:bg-slate-100 hover:bg-primary/10 tr rounded-full ${className}`}
    onClick={onToggle}
    aria-expanded={showComments}
  >
    <MessageCircleMore size={15} className="text-primary" />
    {commentsCount > 0 && `${commentsCount}`}
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

const JournalStory = ({ content, expanded, onExpandedChange }) => {
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
    <div className="mt-3">
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
          className="mt-1 inline text-sm font-semibold text-primary"
          onClick={() => onExpandedChange(true)}
          aria-expanded={expanded}
        >
          Read more
        </button>
      )}
    </div>
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
