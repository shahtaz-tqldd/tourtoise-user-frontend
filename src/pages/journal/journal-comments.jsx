import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Send, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateJournalCommentMutation,
  useCreateJournalReplyMutation,
  useDeleteJournalCommentMutation,
  useJournalCommentsQuery,
  useJournalRepliesQuery,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const commentDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const JournalComments = ({ journalId }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [text, setText] = useState("");
  const { data, isLoading, isError, refetch } = useJournalCommentsQuery({
    journal_id: journalId,
    page_size: 100,
  });
  const [createComment, { isLoading: isCreating }] =
    useCreateJournalCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] =
    useDeleteJournalCommentMutation();
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

  const handleDelete = async (comment, parentId) => {
    try {
      const response = await deleteComment({
        comment_id: comment.id,
        journal_id: journalId,
        parent_id: parentId,
      }).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this comment."));
    }
  };

  return (
    <section className="border-t border-slate-100 pt-5">
      <div className="flex items-center gap-2">
        <MessageCircle size={17} className="text-primary" />
        <h3 className="text-sm font-bold text-slate-950">
          Comments {data?.meta?.count ? `(${data.meta.count})` : ""}
        </h3>
      </div>

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
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-center text-sm text-slate-500">
          No comments yet. Start the conversation.
        </p>
      )}
    </section>
  );
};

const CommentItem = ({
  comment,
  journalId,
  currentUser,
  onDelete,
  isDeleting,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { data, isLoading } = useJournalRepliesQuery(
    { journal_id: journalId, comment_id: comment.id, page_size: 100 },
    { skip: !showReplies },
  );
  const [createReply, { isLoading: isReplying }] =
    useCreateJournalReplyMutation();
  const replies = data?.data || [];
  const canDelete = currentUser?.id === comment.author.id;

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
        canDelete={canDelete}
        isDeleting={isDeleting}
        onDelete={() => onDelete(comment)}
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
            placeholder={`Reply to ${comment.author.name}...`}
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
                canDelete={currentUser?.id === reply.author.id}
                isDeleting={isDeleting}
                onDelete={() => onDelete(reply, comment.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CommentBody = ({ comment, canDelete, onDelete, isDeleting }) => (
  <div className="flex items-start gap-3">
    <div className="size-8 shrink-0 overflow-hidden rounded-full bg-primary/10">
      {comment.author.avatar_url ? (
        <img
          src={comment.author.avatar_url}
          alt={comment.author.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="center h-full text-xs font-bold text-primary">
          {comment.author.name?.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {comment.author.name}
          </p>
          <p className="text-[11px] text-slate-400">
            {commentDateFormatter.format(new Date(comment.created_at))}
          </p>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            aria-label="Delete comment"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {comment.text && (
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
          {comment.text}
        </p>
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

const CommentForm = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
  compact = false,
}) => (
  <form className="mt-4 flex items-end gap-2" onSubmit={onSubmit}>
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={compact ? 1 : 2}
      className={compact ? "min-h-10 resize-none" : "min-h-16 resize-none"}
    />
    <Button
      type="submit"
      size="icon"
      className="shrink-0 rounded-full"
      disabled={isLoading || !value.trim()}
      aria-label={compact ? "Send reply" : "Send comment"}
    >
      <Send size={15} />
    </Button>
  </form>
);

export default JournalComments;
