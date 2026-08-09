import React, { useState } from "react";

import PreviewActionsDropdown from "@/components/shared/preview-actions-dropdown";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Forward,
  Heart,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import JournalComments from "./comments";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useReactJournalMutation } from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { Image } from "@/components/shared/utils";

const getInitialReactionCount = (journal) =>
  journal.likes_count ??
  journal.reactions_count ??
  journal.reacts_count ??
  journal.likes ??
  0;

const getPostShareUrl = (journalId) => {
  if (typeof window === "undefined") return "";

  return new URL(
    `/travel-journal/${journalId}`,
    window.location.origin,
  ).toString();
};

const JournalCard = ({
  journal,
  isSaved = false,
  onSaveToggle,
  onEdit,
  onDelete,
  fullStory = false,
  defaultShowComments = false,
  forceShowComments = false,
  showRepliesByDefault = false,
  className = "",
}) => {
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isReacted, setIsReacted] = useState(
    Boolean(journal.is_liked || journal.is_reacted || journal.has_reacted),
  );
  const [reactionCount, setReactionCount] = useState(() =>
    getInitialReactionCount(journal),
  );
  const [reactJournal, { isLoading: isReacting }] = useReactJournalMutation();
  const authorName = journal.author?.name || "Unknown traveler";
  const authorAvatar = journal.author?.avatar_url;
  const galleryImages = journal.images?.length
    ? journal.images
    : journal.cover_image
      ? [journal.cover_image]
      : [];

  const handleReaction = async () => {
    if (isReacting) return;

    try {
      await reactJournal({
        journal_id: journal.id,
        reacted: isReacted,
      }).unwrap();

      setIsReacted((current) => !current);
      setReactionCount((count) => Math.max(0, count + (isReacted ? -1 : 1)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update reaction."));
    }
  };

  const handleShare = async () => {
    const shareUrl = getPostShareUrl(journal.id);
    if (!shareUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Travel Journal",
          text:
            journal.body || journal.content || "Check out this travel post.",
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Post link copied.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      toast.error("Could not share this post.");
    }
  };

  return (
    <Card
      id={`journal-${journal.id}`}
      className={cn(
        "p-0 bg-transparent md:bg-white md:p-6 rounded-none md:rounded-3xl border-transparent md:border md:border-slate-200",
        className,
      )}
    >
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
              className="mt-4 mb-2 journal-image-slider aspect-[5/3] w-full overflow-hidden rounded-2xl"
            >
              {galleryImages.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <Image src={image} width={600} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <JournalStory
                content={journal.body}
                expanded={fullStory || isStoryExpanded}
                fullStory={fullStory}
                onExpandedChange={setIsStoryExpanded}
              />
              <JournalPostActions
                isReacted={isReacted}
                reactionCount={reactionCount}
                commentsCount={journal.comments_count}
                showComments={forceShowComments || showComments}
                onReact={handleReaction}
                isReacting={isReacting}
                onShare={handleShare}
                onToggleComments={
                  forceShowComments
                    ? undefined
                    : () => setShowComments((show) => !show)
                }
              />
            </div>
            <JournalSaveButton
              journal={journal}
              isSaved={isSaved}
              onSaveToggle={onSaveToggle}
              className=""
            />
          </div>

          {(forceShowComments || showComments) && (
            <div className="mt-5">
              <JournalComments
                journalId={journal.id}
                showRepliesByDefault={showRepliesByDefault}
              />
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
      size === "md" ? "size-9" : "size-8"
    }`}
  >
    {src ? (
      <Image src={src} alt={name} width={40} />
    ) : (
      <span className="center h-full text-xs font-bold">
        {name?.charAt(0).toUpperCase() || "T"}
      </span>
    )}
  </div>
);

const JournalPostActions = ({
  isReacted,
  reactionCount,
  commentsCount,
  showComments,
  onReact,
  isReacting,
  onShare,
  onToggleComments,
}) => (
  <div className="mt-6 flex items-center gap-2">
    <button
      type="button"
      className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
        isReacted
          ? "bg-primary/10 text-primary"
          : "bg-white text-slate-600 hover:bg-primary/10 hover:text-primary md:bg-slate-100"
      }`}
      onClick={onReact}
      disabled={isReacting}
      aria-pressed={isReacted}
      aria-label={isReacted ? "Remove reaction" : "React to post"}
    >
      <Heart size={16} className={isReacted ? "fill-current" : ""} />
      {reactionCount > 0 && reactionCount}
    </button>
    {onToggleComments && (
      <CommentToggle
        showComments={showComments}
        commentsCount={commentsCount}
        onToggle={onToggleComments}
      />
    )}
    <button
      type="button"
      className="inline-flex h-9 items-center justify-center rounded-full bg-white px-3 text-slate-600 transition hover:bg-primary/10 hover:text-primary md:bg-slate-100"
      onClick={onShare}
      aria-label="Share post"
    >
      <Forward size={16} />
    </button>
  </div>
);

const CommentToggle = ({ showComments, commentsCount, onToggle }) => (
  <button
    type="button"
    className="flx h-9 gap-2 rounded-full bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-primary/10 md:bg-slate-100"
    onClick={onToggle}
    aria-expanded={showComments}
    aria-label={showComments ? "Hide comments" : "Show comments"}
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

const STORY_PREVIEW_LENGTH = 350;

const JournalStory = ({
  content = "",
  expanded,
  fullStory,
  onExpandedChange,
}) => {
  const shouldTruncate = !fullStory && content.length > STORY_PREVIEW_LENGTH;
  const visibleContent =
    shouldTruncate && !expanded
      ? `${content.slice(0, STORY_PREVIEW_LENGTH).trimEnd()}...`
      : content;

  return (
    <div className="mt-3">
      <p
        className={`whitespace-pre-line leading-7 text-slate-600 ${
          shouldTruncate && !expanded ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          if (shouldTruncate && !expanded) onExpandedChange(true);
        }}
      >
        {visibleContent}
        {shouldTruncate && expanded && (
          <button
            type="button"
            className="ml-1 inline text-sm font-semibold text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onExpandedChange(false);
            }}
            aria-expanded={expanded}
          >
            ...Show less
          </button>
        )}
        {shouldTruncate && !expanded && (
          <button
            type="button"
            className="ml-2 mt-1 inline text-sm font-semibold text-primary"
            onClick={() => onExpandedChange(true)}
            aria-expanded={expanded}
          >
            Read more
          </button>
        )}
      </p>
    </div>
  );
};

const JournalActions = ({ onEdit, onDelete }) => (
  <PreviewActionsDropdown
    title="Journal actions"
    description="Choose an action for this journal."
    contentClassName="w-36"
    trigger={
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="-mr-2 shrink-0 rounded-full text-slate-500"
        aria-label="Open journal actions"
      >
        <MoreVertical size={16} />
      </Button>
    }
    actions={[
      onEdit && {
        value: "update",
        label: "Update",
        icon: <Pencil size={15} className="shrink-0" />,
        onSelect: onEdit,
      },
      onDelete && {
        value: "delete",
        label: "Delete",
        icon: <Trash2 size={15} className="shrink-0" />,
        destructive: true,
        onSelect: onDelete,
      },
    ].filter(Boolean)}
  />
);

export default JournalCard;
