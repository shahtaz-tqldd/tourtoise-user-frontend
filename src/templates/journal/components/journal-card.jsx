import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  Bookmark,
  EyeOff,
  Flag,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

import PreviewActionsDropdown from "@/components/shared/preview-actions-dropdown";
import { Image } from "@/components/shared/utils";
import { cn } from "@/lib/utils";
import {
  useReactJournalMutation,
  useReportJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import JournalComments from "./comments";
import ReportDialog from "./report-dialog";
import AuthorAvatar from "./author-avatar";
import {
  formatTimeAgo,
  getJournalTags,
  getJournalTitleAndBody,
} from "../journal-utils";

const STORY_PREVIEW_LENGTH = 280;

const getInitialReactionCount = (journal) =>
  journal.likes_count ??
  journal.reactions_count ??
  journal.reacts_count ??
  journal.likes ??
  0;

const getPostShareUrl = (journalId) =>
  typeof window === "undefined"
    ? ""
    : new URL(`/travel-journal/${journalId}`, window.location.origin).toString();

const pluralize = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * Social-style travel post. Public content: guests can read posts and
 * comments; reacting, commenting, saving and reporting ask them to sign in.
 */
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
  const currentUser = useSelector((state) => state.auth.user);
  const { requireAuth } = useAuthGate();
  const [isHidden, setIsHidden] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isReacted, setIsReacted] = useState(
    Boolean(journal.is_liked || journal.is_reacted || journal.has_reacted),
  );
  const [reactionCount, setReactionCount] = useState(() =>
    getInitialReactionCount(journal),
  );
  const [reactJournal, { isLoading: isReacting }] = useReactJournalMutation();
  const [reportJournal, { isLoading: isReporting }] = useReportJournalMutation();

  const isOwnJournal = Boolean(
    journal.is_mine ||
      journal.is_owner ||
      (currentUser?.id &&
        journal.author?.id &&
        String(currentUser.id) === String(journal.author.id)),
  );
  const authorName = journal.author?.name || "Unknown traveler";
  const postUrl = `/travel-journal/${journal.id}`;
  const { title, body } = getJournalTitleAndBody(journal);
  const tags = getJournalTags(journal);
  const galleryImages = journal.images?.length
    ? journal.images
    : journal.cover_image
      ? [journal.cover_image]
      : [];
  const commentsCount = Number(journal.comments_count) || 0;
  const commentsOpen = forceShowComments || showComments;
  const isPrivate = journal.visibility === "private";

  const toggleReaction = async () => {
    try {
      await reactJournal({ journal_id: journal.id, reacted: isReacted }).unwrap();
      setIsReacted((current) => !current);
      setReactionCount((count) => Math.max(0, count + (isReacted ? -1 : 1)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update reaction."));
    }
  };

  const handleReaction = () => {
    if (isReacting) return;
    requireAuth(toggleReaction, { reason: "journal" });
  };

  const handleShare = async () => {
    const shareUrl = getPostShareUrl(journal.id);
    if (!shareUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Travel Journal",
          text: body.slice(0, 140) || "Check out this travel story.",
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      toast.error("Could not share this post.");
    }
  };

  const handleReport = async (reason) => {
    try {
      const response = await reportJournal({
        journalId: journal.id,
        payload: { reason },
      }).unwrap();
      toast.success(response?.message || "Thanks — we'll review this post.");
      setIsHidden(true);
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not report this journal."));
      return false;
    }
  };

  const openComments = () => {
    if (forceShowComments) {
      document.getElementById(`journal-${journal.id}-comments`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    setShowComments((show) => !show);
  };

  if (isHidden) return null;

  return (
    <>
      <article
        id={`journal-${journal.id}`}
        aria-labelledby={title ? `journal-${journal.id}-title` : undefined}
        aria-label={title ? undefined : `Post by ${authorName}`}
        className={cn(
          "overflow-hidden rounded-card bg-surface ring-1 ring-line-subtle",
          className,
        )}
      >
        {/* Author */}
        <header className="flex items-center gap-3 px-4 pt-4 sm:px-5">
          <AuthorAvatar src={journal.author?.avatar_url} name={authorName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-semibold text-heading">{authorName}</p>
            <p className="flx gap-1.5 text-caption text-subtle">
              <time dateTime={journal.created_at}>
                {formatTimeAgo(journal.created_at) || journal.date}
              </time>
              {isPrivate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flx gap-1">
                    <Lock className="size-3" aria-hidden="true" />
                    Only you
                  </span>
                </>
              )}
            </p>
          </div>
          <PostMenu
            onEdit={onEdit ? () => onEdit(journal) : undefined}
            onDelete={onDelete ? () => onDelete(journal) : undefined}
            onHide={!isOwnJournal ? () => setIsHidden(true) : undefined}
            onReport={
              !isOwnJournal
                ? () => requireAuth(() => setReportOpen(true), { reason: "journal" })
                : undefined
            }
          />
        </header>

        {/* Story */}
        <div className="px-4 pt-3 sm:px-5">
          {title && (
            <h2
              id={`journal-${journal.id}-title`}
              className="font-display text-h4 text-heading md:text-h3"
            >
              {fullStory ? (
                title
              ) : (
                <Link
                  href={postUrl}
                  className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {title}
                </Link>
              )}
            </h2>
          )}
          <JournalStory
            content={body}
            expanded={fullStory || isStoryExpanded}
            fullStory={fullStory}
            onExpand={() => setIsStoryExpanded(true)}
          />
          {tags.length > 0 && (
            <ul role="list" className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {tags.slice(0, 6).map((tag) => (
                <li key={tag} className="text-body-sm font-semibold text-brand-text">
                  #{tag.replaceAll(" ", "")}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Photos */}
        {galleryImages.length > 0 && (
          <PhotoGallery images={galleryImages} />
        )}

        {/* Stats */}
        {(reactionCount > 0 || commentsCount > 0) && (
          <div className="flbx px-4 pt-3 text-caption text-subtle sm:px-5">
            <span className="flx gap-1.5">
              {reactionCount > 0 && (
                <>
                  <span className="center size-4.5 rounded-full bg-danger text-white">
                    <Heart className="size-2.5 fill-current" aria-hidden="true" />
                  </span>
                  {pluralize(reactionCount, "like")}
                </>
              )}
            </span>
            {commentsCount > 0 && (
              <button
                type="button"
                onClick={openComments}
                className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {pluralize(commentsCount, "comment")}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mx-4 mt-3 grid grid-cols-4 gap-1 border-t border-line-subtle py-1.5 sm:mx-5">
          <ActionButton
            icon={Heart}
            label="Like"
            active={isReacted}
            activeClassName="text-danger [&_svg]:fill-current"
            onClick={handleReaction}
            disabled={isReacting}
            aria-pressed={isReacted}
            aria-label={isReacted ? "Unlike post" : "Like post"}
          />
          <ActionButton
            icon={MessageCircle}
            label="Comment"
            onClick={openComments}
            aria-expanded={forceShowComments ? undefined : commentsOpen}
            aria-controls={`journal-${journal.id}-comments`}
          />
          <ActionButton icon={Share2} label="Share" onClick={handleShare} aria-label="Share post" />
          <ActionButton
            icon={Bookmark}
            label={isSaved ? "Saved" : "Save"}
            active={isSaved}
            activeClassName="text-brand-text [&_svg]:fill-current"
            onClick={() =>
              onSaveToggle
                ? onSaveToggle(journal)
                : requireAuth(null, { reason: "save" })
            }
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from saved" : "Save post"}
          />
        </div>

        {commentsOpen && (
          <div
            id={`journal-${journal.id}-comments`}
            className="scroll-mt-24 border-t border-line-subtle bg-surface-subtle px-4 pb-4 sm:px-5"
          >
            <JournalComments
              journalId={journal.id}
              showRepliesByDefault={showRepliesByDefault}
            />
          </div>
        )}
      </article>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        subject="post"
        onReport={handleReport}
        isLoading={isReporting}
      />
    </>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  active = false,
  activeClassName,
  className,
  ...props
}) => (
  <button
    type="button"
    className={cn(
      "flex h-10 items-center justify-center gap-2 rounded-xl text-body-sm font-semibold text-body transition-colors hover:bg-surface-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
      active && activeClassName,
      className,
    )}
    {...props}
  >
    <Icon className="size-[18px]" aria-hidden="true" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const PhotoGallery = ({ images }) => (
  <div className="relative mt-3">
    <Swiper
      modules={[Pagination]}
      pagination={images.length > 1 ? { clickable: true, dynamicBullets: true } : false}
      className="journal-image-slider aspect-[4/3] w-full bg-ink-100 lg:aspect-[16/10]"
    >
      {images.map((image, index) => (
        <SwiperSlide key={`${image}-${index}`}>
          <Image
            src={image}
            width={900}
            loading="lazy"
            alt={`Photo ${index + 1} of ${images.length}`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
    {images.length > 1 && (
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-ink-950/60 px-2 py-0.5 text-2xs font-semibold text-white">
        {images.length} photos
      </span>
    )}
  </div>
);

const JournalStory = ({ content = "", expanded, fullStory, onExpand }) => {
  if (!content) return null;

  const shouldTruncate = !fullStory && content.length > STORY_PREVIEW_LENGTH;
  const visibleContent =
    shouldTruncate && !expanded
      ? `${content.slice(0, STORY_PREVIEW_LENGTH).trimEnd()}…`
      : content;

  return (
    <p
      className={cn(
        "mt-1.5 whitespace-pre-line text-body-sm text-body md:text-body-md",
        fullStory && "md:text-body-lg",
      )}
    >
      {visibleContent}
      {shouldTruncate && !expanded && (
        <>
          {" "}
          <button
            type="button"
            onClick={onExpand}
            className="font-semibold text-heading hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            more
          </button>
        </>
      )}
    </p>
  );
};

const PostMenu = ({ onEdit, onDelete, onHide, onReport }) => {
  const actions = [
    onEdit && {
      value: "update",
      label: "Edit post",
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
    onHide && {
      value: "hide",
      label: "Hide post",
      icon: <EyeOff size={15} className="shrink-0" />,
      onSelect: onHide,
    },
    onReport && {
      value: "report",
      label: "Report",
      icon: <Flag size={15} className="shrink-0" />,
      destructive: true,
      onSelect: onReport,
    },
  ].filter(Boolean);

  if (!actions.length) return null;

  return (
    <PreviewActionsDropdown
      title="Post actions"
      description="Choose an action for this post."
      contentClassName="w-40"
      trigger={
        <button
          type="button"
          className="center -mr-1.5 size-9 shrink-0 rounded-full text-subtle transition hover:bg-surface-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Post actions"
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
        </button>
      }
      actions={actions}
    />
  );
};

export default JournalCard;
