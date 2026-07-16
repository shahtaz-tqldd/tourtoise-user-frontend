import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateJournalCommentMutation,
  useCreateJournalReplyMutation,
  useDeleteJournalCommentMutation,
  useJournalCommentsQuery,
  useJournalRepliesQuery,
  useUpdateJournalCommentMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { DeleteDialog } from "@/components/shared/confirm-dialog";

const commentDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const JournalComments = ({ journalId, showRepliesByDefault = false }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [text, setText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const { data, isLoading, isError, refetch } = useJournalCommentsQuery({
    journal_id: journalId,
    page_size: 100,
  });
  const [createComment, { isLoading: isCreating }] =
    useCreateJournalCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] =
    useDeleteJournalCommentMutation();
  const [updateComment, { isLoading: isUpdating }] =
    useUpdateJournalCommentMutation();
  const comments = data?.data || [];

  const handleCreate = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    try {
      await createComment({
        journal_id: journalId,
        body: { text: trimmedText },
      }).unwrap();
      setText("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not add your comment."));
    }
  };

  const requestDelete = (comment, parentId) => {
    setCommentToDelete({ comment, parentId });
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

  const handleUpdate = async (comment, text, parentId) => {
    try {
      const response = await updateComment({
        comment_id: comment.id,
        journal_id: journalId,
        parent_id: parentId,
        body: { text },
      }).unwrap();
      toast.success(response.message || "Comment updated.");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this comment."));
      return false;
    }
  };

  return (
    <section className="border-t border-slate-100">
      <CommentForm
        value={text}
        onChange={setText}
        onSubmit={handleCreate}
        isLoading={isCreating}
        placeholder="Write a comment..."
      />

      {isLoading ? (
        <div className="mt-5 space-y-4">
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : isError ? (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700">Could not load comments.</p>
          <Button variant="ghost" size="sm" className="mt-1" onClick={refetch}>
            Try again
          </Button>
        </div>
      ) : comments.length ? (
        <div className="mt-5 space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              journalId={journalId}
              currentUser={currentUser}
              onDelete={requestDelete}
              onUpdate={handleUpdate}
              isDeleting={isDeleting}
              isUpdating={isUpdating}
              showRepliesByDefault={showRepliesByDefault}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-center text-xs text-slate-500">
          No comments yet. Start the conversation.
        </p>
      )}
      <DeleteDialog
        open={Boolean(commentToDelete)}
        onOpenChange={(open) => {
          if (!open) setCommentToDelete(null);
        }}
        title="Delete comment?"
        description="This permanently deletes this comment and any related replies."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </section>
  );
};

const CommentItem = ({
  comment,
  journalId,
  currentUser,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
  showRepliesByDefault,
}) => {
  const [showReplies, setShowReplies] = useState(
    showRepliesByDefault && comment.replies_count > 0,
  );
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { data, isLoading } = useJournalRepliesQuery(
    { journal_id: journalId, comment_id: comment.id, page_size: 100 },
    { skip: !showReplies },
  );
  const [createReply, { isLoading: isReplying }] =
    useCreateJournalReplyMutation();
  const replies = data?.data || [];
  const canManage = currentUser?.id === comment.author?.id;

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

  return (
    <div>
      <CommentBody
        comment={comment}
        canManage={canManage}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
        onDelete={() => onDelete(comment)}
        onUpdate={(text) => onUpdate(comment, text)}
      />
      <div className="ml-10 mt-2 flex items-center gap-4 text-xs font-semibold">
        <button
          type="button"
          className="text-primary"
          onClick={() => setShowReplyForm((show) => !show)}
        >
          Reply
        </button>
        {comment.replies_count > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-slate-500"
            onClick={() => setShowReplies((show) => !show)}
          >
            {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showReplies ? "Hide" : "View"} {comment.replies_count}{" "}
            {comment.replies_count === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="ml-10">
          <CommentForm
            value={replyText}
            onChange={setReplyText}
            onSubmit={handleReply}
            isLoading={isReplying}
            placeholder={`Reply to ${comment.author?.name || "traveler"}...`}
            compact
          />
        </div>
      )}

      {showReplies && (
        <div className="ml-10 mt-4 space-y-4 border-l border-slate-200 pl-4">
          {isLoading ? (
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ) : (
            replies.map((reply) => (
              <CommentBody
                key={reply.id}
                comment={reply}
                canManage={currentUser?.id === reply.author?.id}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
                onDelete={() => onDelete(reply, comment.id)}
                onUpdate={(text) => onUpdate(reply, text, comment.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CommentBody = ({
  comment,
  canManage,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || "");

  const handleUpdate = async (event) => {
    event.preventDefault();
    const trimmedText = editText.trim();
    if (!trimmedText || trimmedText === (comment.text || "").trim()) {
      setIsEditing(false);
      setEditText(comment.text || "");
      return;
    }

    const updated = await onUpdate(trimmedText);
    if (updated) setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="size-8 shrink-0 overflow-hidden rounded-full bg-primary/10">
        {comment.author?.avatar_url ? (
          <img
            src={comment.author.avatar_url}
            alt={comment.author.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="center h-full text-xs font-bold text-primary">
            {comment.author?.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {comment.author?.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {commentDateFormatter.format(new Date(comment.created_at))}
            </p>
          </div>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isDeleting || isUpdating}
                  className="-mr-2 shrink-0 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Open comment actions"
                >
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-fit">
                <DropdownMenuItem
                  onSelect={() => {
                    setEditText(comment.text || "");
                    setIsEditing(true);
                  }}
                  className="!text-xs font-medium"
                >
                  <Pencil size={12} />
                  Update Comment
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={onDelete} className="text-xs font-medium">
                  <Trash2 size={12} />
                  Delete Comment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isEditing ? (
          <CommentForm
            value={editText}
            onChange={setEditText}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
            placeholder="Update comment..."
            compact
            submitLabel="Update comment"
          />
        ) : (
          comment.text && (
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
              {comment.text}
            </p>
          )
        )}
        {isEditing && (
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-slate-500"
            onClick={() => {
              setIsEditing(false);
              setEditText(comment.text || "");
            }}
            disabled={isUpdating}
          >
            Cancel
          </button>
        )}
        {comment.image_url && (
          <img
            src={comment.image_url}
            alt="Comment attachment"
            className="mt-2 max-h-52 rounded-xl object-cover"
          />
        )}
      </div>
    </div>
  );
};

const CommentForm = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
  compact = false,
  submitLabel,
}) => {
  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();

    if (!isLoading && value.trim()) {
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form className="mt-4 px-1 flex items-end gap-2" onSubmit={onSubmit}>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="resize-none rounded-xl min-h-10 max-h-36 py-3 bg-white"
      />
      <Button
        type="submit"
        size="icon"
        className="shrink-0 rounded-full"
        disabled={isLoading || !value.trim()}
        aria-label={submitLabel || (compact ? "Send reply" : "Send comment")}
      >
        <Send size={15} />
      </Button>
    </form>
  );
};

export default JournalComments;
