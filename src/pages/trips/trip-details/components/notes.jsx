import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MoreVertical,
  Notebook,
  PencilLine,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import PreviewContent from "@/components/shared/preview-content";
import PreviewActionsDropdown from "@/components/shared/preview-actions-dropdown";
import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "@/components/ui/card";
import { FloatingTextarea } from "@/components/ui/textarea";
import {
  useDeleteTripNoteMutation,
  useTripNoteDetailsQuery,
  useTripNoteListQuery,
  useUpdateTripNoteMutation,
  useCreateTripNoteMutation,
} from "@/features/trips/tripApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import { UserAvatar } from "@/components/shared/user-profile";
import { cn } from "@/lib/utils";

const formatNoteDate = (value) => {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getNoteContent = (note) => note?.content || note?.body || "";

const resizeTextareaToContent = (textarea) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const NotesListSkeleton = () => (
  <div className="space-y-4" aria-label="Loading notes">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-6 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="size-8 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    ))}
  </div>
);

const TripNotes = ({ tripId }) => {
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const { data, isFetching, isError, refetch } = useTripNoteListQuery(
    { trip_id: tripId, page_size: 100 },
    { skip: !tripId },
  );
  const [deleteTripNote, { isLoading: isDeleting }] =
    useDeleteTripNoteMutation();
  const [updateTripNote, { isLoading: isUpdating }] =
    useUpdateTripNoteMutation();
  const notes = useMemo(() => data?.data || [], [data]);

  const openCreateNote = () => {
    setIsCreateNoteOpen(true);
  };

  const handleDeleteNote = async () => {
    if (!deletingNote) return;

    try {
      const response = await deleteTripNote({
        trip_id: tripId,
        note_id: deletingNote.id,
      }).unwrap();
      toast.success(response?.message || "Note deleted.");
      setDeletingNote(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this note."));
    }
  };

  const handleUpdateNote = async (noteId, payload) => {
    try {
      const response = await updateTripNote({
        trip_id: tripId,
        note_id: noteId,
        payload,
      }).unwrap();
      toast.success(response?.message || "Note updated.");
      setEditingNote(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this note."));
    }
  };

  return (
    <>
      <PreviewCard className="space-y-5">
        <div className="flex justify-between">
          <SectionHeader
            icon={Notebook}
            title="Notes"
            description="Keep important staff in here"
          />
          <Button
            className="!pl-2 !pr-3.5 rounded-full"
            size="sm"
            onClick={openCreateNote}
            disabled={!tripId}
          >
            <Plus size={14} />
            Add Note
          </Button>
        </div>

        {isFetching ? <NotesListSkeleton /> : null}

        {!isFetching && notes.length ? (
          <span className="text-sm text-slate-500 font-semibold block mb-4">
            {notes.length} saved notes
          </span>
        ) : null}

        {!isFetching && isError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Could not load notes.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 bg-white"
              onClick={refetch}
            >
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        ) : null}

        {!isFetching && !isError ? (
          <div className="space-y-4">
            {notes.length ? (
              notes.map((note) => (
                <NoteCard
                  key={`${note.id}-${editingNote?.id === note.id ? "edit" : "view"}`}
                  note={note}
                  isEditing={editingNote?.id === note.id}
                  isUpdating={isUpdating}
                  onEdit={() => setEditingNote(note)}
                  onCancelEdit={() => setEditingNote(null)}
                  onSave={(payload) => handleUpdateNote(note.id, payload)}
                  onDelete={() => setDeletingNote(note)}
                />
              ))
            ) : (
              <EmptyState
                title="Empty Notes"
                description="You have not created any notes yet"
              />
            )}
          </div>
        ) : null}
      </PreviewCard>

      <NotesCreateDialog
        open={isCreateNoteOpen}
        onOpenChange={setIsCreateNoteOpen}
        tripId={tripId}
      />
      <DeleteDialog
        open={Boolean(deletingNote)}
        onOpenChange={(open) => {
          if (!open) setDeletingNote(null);
        }}
        title="Delete this note"
        description="Deleting this note will remove this content for good, you can't undo this once deleted!"
        onConfirm={handleDeleteNote}
        isLoading={isDeleting}
      />
    </>
  );
};

const NoteCard = ({
  note,
  isEditing,
  isUpdating,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) => {
  const textareaRef = useRef(null);
  const content = getNoteContent(note);
  const [noteContent, setNoteContent] = useState(content);
  const [isExpanded, setIsExpanded] = useState(false);
  const isLonger = content.length > 500;
  const visibleContent =
    isExpanded || !isLonger ? content : content.slice(0, 500);

  useEffect(() => {
    if (!isEditing) return;

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      resizeTextareaToContent(textarea);
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      requestAnimationFrame(() => {
        textarea.scrollIntoView({ block: "end", inline: "nearest" });
      });
    });
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    resizeTextareaToContent(textarea);
  }, [isEditing, noteContent]);

  const handleContentChange = (event) => {
    const textarea = event.target;

    setNoteContent(textarea.value);
    resizeTextareaToContent(textarea);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextContent = noteContent.trim();

    if (!nextContent) {
      toast.error("Add note body.");
      return;
    }

    await onSave({ content: nextContent });
  };

  if (isEditing) {
    return (
      <form
        className="rounded-xl border border-slate-200 bg-slate-50 p-4 pb-3"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserAvatar className="size-6" />
            <span className="text-xs font-medium text-slate-400">
              Created on {formatNoteDate(note.created_at || note.updated_at)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              size="sm"
              onClick={onCancelEdit}
              className="!text-xs rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              size="sm"
              className="!text-xs rounded-full"
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={noteContent}
          onChange={handleContentChange}
          disabled={isUpdating}
          required
          rows={1}
          className="mt-4 block w-full resize-none overflow-hidden border-none bg-transparent text-sm leading-7 text-slate-500 outline-none placeholder:text-slate-400 disabled:opacity-60"
        />
      </form>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar className="size-6" />
          <span className="text-xs font-medium text-slate-400">
            Created on {formatNoteDate(note.created_at || note.updated_at)}
          </span>
        </div>
        <PreviewActionsDropdown
          title="Note actions"
          description="Choose an action for this note."
          contentClassName="w-36"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Note actions"
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <MoreVertical size={16} />
            </Button>
          }
          actions={[
            {
              value: "update",
              label: "Update",
              icon: <PencilLine size={15} className="shrink-0" />,
              onSelect: onEdit,
            },
            {
              value: "delete",
              label: "Delete",
              icon: <Trash2 size={15} className="shrink-0" />,
              destructive: true,
              onSelect: onDelete,
            },
          ]}
        />
      </div>
      <p
        className={cn(
          "mt-2 whitespace-pre-wrap !leading-7 text-sm text-slate-500",
          isLonger && !isExpanded ? "cursor-pointer" : "",
        )}
        onClick={() => {
          if (isLonger && !isExpanded) setIsExpanded((current) => !current);
        }}
      >
        {visibleContent}
        <span>{isLonger && !isExpanded ? "..." : null}</span>
        {isLonger ? (
          <button
            type="button"
            className="mt-2 ml-2 text-xs font-semibold text-primary hover:text-primary/80"
            onClick={() => {
              if (isExpanded) setIsExpanded((current) => !current);
            }}
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        ) : null}
      </p>
    </article>
  );
};

const NotesCreateDialog = ({ open, onOpenChange, tripId, noteId }) => {
  const isEditing = Boolean(noteId);
  const { data: noteDetailsData, isFetching: isFetchingDetails } =
    useTripNoteDetailsQuery(
      { trip_id: tripId, note_id: noteId },
      { skip: !open || !tripId || !noteId },
    );
  const [createTripNote, { isLoading: isCreating }] =
    useCreateTripNoteMutation();
  const [updateTripNote, { isLoading: isUpdating }] =
    useUpdateTripNoteMutation();
  const isLoading = isCreating || isUpdating;
  const note = noteDetailsData?.data || [];
  const formKey = `${open ? "open" : "closed"}-${noteId || "new"}-${
    noteDetailsData ? "loaded" : "empty"
  }`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload = {
      content: String(formData.get("body") || "").trim(),
    };

    if (!payload.content) {
      toast.error("Add note body.");
      return;
    }

    try {
      const response = isEditing
        ? await updateTripNote({
            trip_id: tripId,
            note_id: noteId,
            payload,
          }).unwrap()
        : await createTripNote({ trip_id: tripId, payload }).unwrap();

      toast.success(
        response?.message || `Note ${isEditing ? "updated" : "created"}.`,
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save this note."));
    }
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={onOpenChange}
      className="md:p-8 p-6 !max-w-xl h-fit"
    >
      <h2 className="text-lg font-bold mt-2 md:mt-0">
        {isEditing ? "Update note" : "Create a new note"}
      </h2>
      <p className="text-sm mt-1 text-slate-500">
        Keep important details for your trip here.
      </p>
      <form key={formKey} className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <FloatingTextarea
          name="body"
          label="Notes"
          defaultValue={note.body || note.content || ""}
          disabled={isFetchingDetails || isLoading}
          rows={7}
          textareaClassName="min-h-44 leading-7"
          required
        />
        <div className="mt-8 flex md:flex-row flex-col w-full md:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isFetchingDetails || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

export default TripNotes;
