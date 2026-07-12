import React, { useMemo, useState } from "react";
import {
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import PreviewContent from "@/components/shared/preview-content";
import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card, { PreviewCard } from "@/components/ui/card";
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

const TripNotes = ({ tripId }) => {
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const { data, isFetching, isError, refetch } = useTripNoteListQuery(
    { trip_id: tripId, page_size: 100 },
    { skip: !tripId },
  );
  const [deleteTripNote, { isLoading: isDeleting }] =
    useDeleteTripNoteMutation();
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
      setViewingNote(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this note."));
    }
  };

  return (
    <>
      <PreviewCard className="space-y-5 md:rounded-t-none">
        <div className="flex justify-between">
          <SectionHeader
            icon={ShieldCheck}
            title="Notes"
            description="Additional information for this trip."
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

        {isFetching ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-500">
            <Loader2 className="animate-spin text-primary" size={16} />
            Loading notes...
          </div>
        ) : null}

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
                <article
                  key={note.id}
                  className="cursor-pointer rounded-xl border border-slate-200 p-3 bg-slate-50 hover:bg-slate-100 tr"
                  onClick={() => setViewingNote(note)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mt-1 leading-7 line-clamp-3 text-sm text-slate-500">
                        {note.content}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatNoteDate(note.created_at || note.updated_at)}
                  </p>
                </article>
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
      <NotesViewDialog
        key={viewingNote?.id || "empty-note-view"}
        open={Boolean(viewingNote)}
        onOpenChange={(open) => {
          if (!open) setViewingNote(null);
        }}
        tripId={tripId}
        note={viewingNote}
        onDelete={() => {
          setDeletingNote(viewingNote);
          setViewingNote(null);
        }}
      />
    </>
  );
};

const NotesViewDialog = ({ open, onOpenChange, tripId, note, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [savedContent, setSavedContent] = useState("");
  const { data: noteDetailsData, isFetching: isFetchingDetails } =
    useTripNoteDetailsQuery(
      { trip_id: tripId, note_id: note?.id },
      { skip: !open || !tripId || !note?.id },
    );
  const [updateTripNote, { isLoading: isUpdating }] =
    useUpdateTripNoteMutation();
  const noteDetails = noteDetailsData?.data || noteDetailsData || {};
  const content =
    savedContent ||
    noteDetails.content ||
    noteDetails.body ||
    note?.content ||
    "";
  const date = formatNoteDate(
    noteDetails.created_at ||
      noteDetails.updated_at ||
      note?.created_at ||
      note?.updated_at,
  );

  const handleUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contentValue = String(formData.get("content") || "").trim();

    if (!contentValue) {
      toast.error("Add note body.");
      return;
    }

    try {
      const response = await updateTripNote({
        trip_id: tripId,
        note_id: note.id,
        payload: { content: contentValue },
      }).unwrap();
      setSavedContent(response?.data?.content || contentValue);
      setIsEditing(false);
      toast.success(response?.message || "Note updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this note."));
    }
  };

  if (!note) return null;

  return (
    <PreviewContent
      open={open}
      onOpenChange={onOpenChange}
      className="md:p-8 p-6 !max-w-xl h-[90vh] md:h-fit max-h-[90vh]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserAvatar className="size-6" />
          <div>
            <span className="text-xs font-medium text-slate-400">
              Created on {date}
            </span>
          </div>
        </div>
        {!isEditing && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Update note"
              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <PencilLine size={12} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Delete note"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form
          key={`${note.id}-${content}`}
          className="mt-6 space-y-5"
          onSubmit={handleUpdate}
        >
          <FloatingTextarea
            name="content"
            label="Notes"
            defaultValue={content}
            disabled={isFetchingDetails || isUpdating}
            rows={8}
            textareaClassName="min-h-52 leading-7"
            required
          />
          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              className="w-full md:w-auto"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isFetchingDetails || isUpdating}
              className="w-full md:w-auto"
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {isFetchingDetails ? "Loading note..." : content}
        </p>
      )}
    </PreviewContent>
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
