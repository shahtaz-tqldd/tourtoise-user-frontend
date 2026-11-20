import React, { useId, useState } from "react";
import { MoreHorizontal, EyeOff, Flag, Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import PreviewActionsDropdown from "@/components/shared/preview-actions-dropdown";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/shared/utils";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import {
  useCreateJournalCommentMutation,
  useCreateJournalReplyMutation,
  useDeleteJournalCommentMutation,
  useJournalCommentsQuery,
  useJournalRepliesQuery,
  useReportCommentMutation,
  useUpdateJournalCommentMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { cn } from "@/lib/utils";
import ReportDialog from "./report-dialog";
import AuthorAvatar from "./author-avatar";
import { formatTimeAgo } from "../journal-utils";

const isAuthor = (user, comment) =>
  Boolean(user?.id && comment.author?.id && String(user.id) === String(comment.author.id));

const JournalComments = ({ journalId, showRepliesByDefault = false }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const { isAuthenticated } = useAuthGate();
  const [text, setText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const { data, isLoading, isError, refetch } = useJournalCommentsQuery({
    journal_id: journalId,
    page_size: 100,
  });
  const [createComment, { isLoading: isCreating }] = useCreateJournalCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteJournalCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateJournalCommentMutation();
  const comments = data?.data || [];

  const handleCreate = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    try {
      await createComment({ journal_id: journalId, body: { text: trimmedText } }).unwrap();
      setText("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not add your comment."));
    }
  };

  const handleDelete = async () => {
    if (!commentToDelete) return;

    try {
      const response = await deleteComment({
        comment_id: commentToDelete.comment.id,
        journal_id: journalId,
        parent_id: commentToDelete.parentId,
      }).unwrap();
      toast.success(response.message || "Comment deleted.");
      setCommentToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this comment."));
    }
  };

  const handleUpdate = async (comment, nextText, parentId) => {
    try {
      await updateComment({
        comment_id: comment.id,
        journal_id: journalId,
        parent_id: parentId,
        body: { text: nextText },
      }).unwrap();
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this comment."));
      return false;
    }
  };

  return (
    <section aria-label="Comments" className="pt-4">
      {isLoading ? (
        <div className="space-y-3" aria-label="Loading comments">
          {[0, 1].map((key) => (
            <div key={key} className="flex gap-2.5 motion-safe:animate-pulse">
              <span className="size-8 shrink-0 rounded-full bg-ink-200/70" />
              <span className="h-14 w-2/3 rounded-2xl bg-ink-200/70" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-danger-soft p-3 text-center text-body-sm text-danger">
          Could not load comments.{" "}
          <button type="button" className="font-semibold underline" onClick={refetch}>
            Try again
          </button>
        </div>
      ) : comments.length ? (
        <ul role="list" className="space-y-4">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              journalId={journalId}
              currentUser={currentUser}
              onDelete={(target, parentId) => setCommentToDelete({ comment: target, parentId })}
              onUpdate={handleUpdate}
              isBusy={isDeleting || isUpdating}
              showRepliesByDefault={showRepliesByDefault}
            />
          ))}
        </ul>
      ) : (
        <p className="py-1 text-center text-caption text-subtle">
          No comments yet. {isAuthenticated ? "Be the first to say something." : ""}
        </p>
      )}

      <div className="mt-4">
        {isAuthenticated ? (
          <CommentComposer
            user={currentUser}
            value={text}
            onChange={setText}
            onSubmit={handleCreate}
            isLoading={isCreating}
            placeholder="Write a comment…"
          />
        ) : (
          <GuestCommentPrompt />
        )}
      </div>

      <DeleteDialog
        open={Boolean(commentToDelete)}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
        title="Delete comment?"
        description="This permanently deletes this comment and its replies."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </section>
  );
};

const GuestCommentPrompt = () => {
  const { openAuth } = useAuthGate();

  return (
    <div className="flbx gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line-subtle">
      <p className="text-body-sm text-subtle">Join the conversation with fellow travelers.</p>
      <Button
        type="button"
        variant="soft"
        size="sm"
        className="shrink-0 rounded-full"
        onClick={() => openAuth("login", "journal")}
      >
        Sign in to comment
      </Button>
    </div>
  );
};

const CommentThread = ({
  comment,
  journalId,
  currentUser,
  onDelete,
  onUpdate,
  isBusy,
  showRepliesByDefault,
}) => {
  const { isAuthenticated, requireAuth } = useAuthGate();
  const [isHidden, setIsHidden] = useState(false);
  const repliesCount = Number(comment.replies_count) || 0;
  const [showReplies, setShowReplies] = useState(showRepliesByDefault && repliesCount > 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { data, isLoading } = useJournalRepliesQuery(
    { journal_id: journalId, comment_id: comment.id, page_size: 100 },
    { skip: !showReplies },
  );
  const [createReply, { isLoading: isReplying }] = useCreateJournalReplyMutation();
  const replies = data?.data || [];

  const handleReply = async (event) => {
    event.preventDefault();
    const trimmedText = replyText.trim();
    if (!trimmedText) return;

    try {
      await createReply({
        journal_id: journalId,
        comment_id: comment.id,
        body: { text: trimmedText },
      }).unwrap();
      setReplyText("");
      setShowReplies(true);
      setShowReplyForm(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not add your reply."));
    }
  };

  if (isHidden) return null;

  return (
    <li>
      <CommentBubble
        comment={comment}
        canManage={isAuthor(currentUser, comment)}
        isBusy={isBusy}
        onDelete={() => onDelete(comment)}
        onUpdate={(nextText) => onUpdate(comment, nextText)}
        onHide={() => setIsHidden(true)}
        onReply={() =>
          requireAuth(() => setShowReplyForm((show) => !show), { reason: "journal" })
        }
      />

      {(repliesCount > 0 || showReplyForm) && (
        <div className="ml-[42px] mt-2 space-y-3">
          {repliesCount > 0 && !showReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="flx gap-2 text-caption font-semibold text-subtle hover:text-heading"
            >
              <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
              View {repliesCount === 1 ? "1 reply" : `${repliesCount} replies`}
            </button>
          )}

          {showReplies &&
            (isLoading ? (
              <div className="h-12 w-1/2 rounded-2xl bg-ink-200/70 motion-safe:animate-pulse" />
            ) : (
              <ul role="list" className="space-y-3">
                {replies.map((reply) => (
                  <li key={reply.id}>
                    <CommentBubble
                      comment={reply}
                      size="xs"
                      canManage={isAuthor(currentUser, reply)}
                      isBusy={isBusy}
                      onDelete={() => onDelete(reply, comment.id)}
                      onUpdate={(nextText) => onUpdate(reply, nextText, comment.id)}
                    />
                  </li>
                ))}
              </ul>
            ))}

          {showReplyForm && isAuthenticated && (
            <CommentComposer
              user={currentUser}
              size="xs"
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReply}
              isLoading={isReplying}
              placeholder={`Reply to ${comment.author?.name || "traveler"}…`}
              submitLabel="Send reply"
              autoFocus
            />
          )}
        </div>
      )}
    </li>
  );
};

const CommentBubble = ({
  comment,
  size = "sm",
  canManage,
  isBusy,
  onDelete,
  onUpdate,
  onHide,
  onReply,
}) => {
  const { requireAuth } = useAuthGate();
  const [isHidden, setIsHidden] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || "");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportComment, { isLoading: isReporting }] = useReportCommentMutation();
  const authorName = comment.author?.name || "Traveler";

  const hideComment = () => {
    setIsHidden(true);
    onHide?.();
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const trimmedText = editText.trim();
    if (!trimmedText || trimmedText === (comment.text || "").trim()) {
      setIsEditing(false);
      setEditText(comment.text || "");
      return;
    }
    if (await onUpdate(trimmedText)) setIsEditing(false);
  };

  const handleReport = async (reason) => {
    try {
      const response = await reportComment({
        commentId: comment.id,
        payload: { reason },
      }).unwrap();
      toast.success(response?.message || "Thanks — we'll review this comment.");
      hideComment();
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not report this comment."));
      return false;
    }
  };

  if (isHidden) return null;

  const actions = canManage
    ? [
        {
          value: "update",
          label: "Edit",
          icon: <Pencil size={14} className="shrink-0" />,
          onSelect: () => {
            setEditText(comment.text || "");
            setIsEditing(true);
          },
        },
        {
          value: "delete",
          label: "Delete",
          icon: <Trash2 size={14} className="shrink-0" />,
          destructive: true,
          onSelect: onDelete,
        },
      ]
    : [
        {
          value: "hide",
          label: "Hide",
          icon: <EyeOff size={14} className="shrink-0" />,
          onSelect: hideComment,
        },
        {
          value: "report",
          label: "Report",
          icon: <Flag size={14} className="shrink-0" />,
          destructive: true,
          onSelect: () => requireAuth(() => setReportOpen(true), { reason: "journal" }),
        },
      ];

  return (
    <div className="group/comment flex items-start gap-2.5">
      <AuthorAvatar src={comment.author?.avatar_url} name={authorName} size={size} />
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <CommentComposer
            value={editText}
            onChange={setEditText}
            onSubmit={handleUpdate}
            isLoading={isBusy}
            placeholder="Edit your comment…"
            submitLabel="Save comment"
            onCancel={() => {
              setIsEditing(false);
              setEditText(comment.text || "");
            }}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-1">
            <div className="min-w-0 rounded-2xl rounded-tl-md bg-surface px-3.5 py-2 ring-1 ring-line-subtle">
              <p className="text-caption font-semibold text-heading">{authorName}</p>
              {comment.text && (
                <p className="whitespace-pre-line break-words text-body-sm text-body">
                  {comment.text}
                </p>
              )}
            </div>
            <PreviewActionsDropdown
              title="Comment actions"
              description="Choose an action for this comment."
              contentClassName="w-36"
              trigger={
                <button
                  type="button"
                  disabled={isBusy}
                  className="center size-8 shrink-0 rounded-full text-faint opacity-100 transition hover:bg-surface-muted hover:text-heading focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:opacity-0 md:group-hover/comment:opacity-100 md:data-[state=open]:opacity-100"
                  aria-label={`Actions for ${authorName}'s comment`}
                >
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </button>
              }
              actions={actions}
            />
          </div>
        )}

        {comment.image_url && (
          <Image
            src={comment.image_url}
            alt="Comment attachment"
            className="mt-2 max-h-52 w-auto rounded-xl"
          />
        )}

        {!isEditing && (
          <div className="mt-1 flex items-center gap-3 px-3.5 text-caption text-subtle">
            <time dateTime={comment.created_at}>{formatTimeAgo(comment.created_at)}</time>
            {onReply && (
              <button
                type="button"
                onClick={onReply}
                className="font-semibold hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Reply
              </button>
            )}
          </div>
        )}
      </div>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        subject="comment"
        onReport={handleReport}
        isLoading={isReporting}
      />
    </div>
  );
};

/** Rounded input with an inline send button; Enter sends, Shift+Enter breaks. */
const CommentComposer = ({
  user,
  size = "sm",
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
  submitLabel = "Send comment",
  onCancel,
  autoFocus,
}) => {
  const inputId = useId();
  const canSend = !isLoading && value.trim();

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2.5">
      {user && <AuthorAvatar src={user.avatar_url} name={user.name} size={size} />}
      <div className="min-w-0 flex-1">
        <div className="flex items-end rounded-2xl bg-surface pl-3.5 pr-1 ring-1 ring-line focus-within:ring-2 focus-within:ring-ring/60">
          <label htmlFor={inputId} className="sr-only">
            {placeholder}
          </label>
          <textarea
            id={inputId}
            rows={1}
            value={value}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && onCancel) onCancel();
              if (event.key !== "Enter" || event.shiftKey) return;
              event.preventDefault();
              if (canSend) event.currentTarget.form?.requestSubmit();
            }}
            className="field-sizing-content max-h-36 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-body-sm text-heading outline-none placeholder:text-subtle"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label={submitLabel}
            className={cn(
              "center mb-1 size-8 shrink-0 rounded-full transition",
              canSend ? "text-brand-text hover:bg-accent" : "text-faint",
            )}
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
          </button>
        </div>
        {onCancel && (
          <p className="mt-1 px-3.5 text-caption text-subtle">
            Escape to{" "}
            <button type="button" onClick={onCancel} className="font-semibold text-brand-text">
              cancel
            </button>
          </p>
        )}
      </div>
    </form>
  );
};

export default JournalComments;
