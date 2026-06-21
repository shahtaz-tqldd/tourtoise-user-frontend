import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Plus, X } from "lucide-react";

import ConfirmDialog from "@/components/shared/confirm-dialog";
import { SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput, Input } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import {
  useCreateJournalMutation,
  useDeleteJournalMutation,
  useMyJournalListQuery,
  useUpdateJournalMutation,
  useUserJournalListQuery,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import JournalCard from "../journal/journal-card";
import {
  createJournalFormData,
  normalizeJournals,
} from "../journal/journal-utils";

const TravelJournal = ({ userId, isOwner = false }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [deletingJournal, setDeletingJournal] = useState(null);
  const myQuery = useMyJournalListQuery(
    { page_size: 100 },
    { skip: !isOwner },
  );
  const userQuery = useUserJournalListQuery(
    { user_id: userId, page_size: 100 },
    { skip: isOwner || !userId },
  );
  const query = isOwner ? myQuery : userQuery;
  const journals = useMemo(
    () => normalizeJournals(query.data?.data),
    [query.data],
  );
  const [deleteJournal, { isLoading: isDeleting }] =
    useDeleteJournalMutation();

  const openCreate = () => {
    setEditingJournal(null);
    setFormOpen(true);
  };

  const openEdit = (journal) => {
    setEditingJournal(journal);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteJournal(deletingJournal.id).unwrap();
      toast.success(response.message);
      setDeletingJournal(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this journal."));
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeader
          title="Travel Journal"
          description="Save trip stories, photo memories, and small reminders from places worth revisiting."
        />

        {isOwner && (
          <Button className="w-full md:w-auto" onClick={openCreate}>
            <Plus size={16} />
            New Journal
          </Button>
        )}
      </div>

      <div className="mt-8">
        {query.isLoading || query.isFetching ? (
          <JournalSkeleton />
        ) : query.isError ? (
          <div className="rounded-2xl bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
            Could not load journals.
          </div>
        ) : journals.length ? (
          <div className="grid gap-5">
            {journals.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                onEdit={isOwner ? openEdit : undefined}
                onDelete={isOwner ? setDeletingJournal : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            {isOwner
              ? "You have not written a travel journal yet."
              : "No public journals are available."}
          </div>
        )}
      </div>

      {isOwner && formOpen && (
        <JournalFormDialog
          key={editingJournal?.id || "new-journal"}
          open={formOpen}
          onOpenChange={setFormOpen}
          journal={editingJournal}
        />
      )}
      <ConfirmDialog
        open={Boolean(deletingJournal)}
        onOpenChange={(open) => !open && setDeletingJournal(null)}
        title="Delete journal?"
        description="This permanently deletes this journal and all its comments."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </Card>
  );
};

export const JournalFormDialog = ({ open, onOpenChange, journal }) => {
  const [content, setContent] = useState(journal?.body || "");
  const [visibility, setVisibility] = useState(
    journal?.visibility || "public",
  );
  const [tags, setTags] = useState((journal?.tags || []).join(", "));
  const [images, setImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [createJournal, { isLoading: isCreating }] =
    useCreateJournalMutation();
  const [updateJournal, { isLoading: isUpdating }] =
    useUpdateJournalMutation();
  const isEditing = Boolean(journal);
  const isSubmitting = isCreating || isUpdating;
  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(
    () => () => {
      imagePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
    },
    [imagePreviews],
  );

  const visibleExistingImages = (journal?.imageRecords || []).filter(
    (image) => !removedImageIds.includes(image.id),
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsedTags = [
      ...new Set(
        tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ];
    const body = createJournalFormData({
      title: content.trim().split("\n")[0].slice(0, 200) || "Travel journal",
      content,
      visibility,
      tags: parsedTags,
      images,
      removeImageIds: removedImageIds,
    });

    try {
      const response = isEditing
        ? await updateJournal({ journal_id: journal.id, body }).unwrap()
        : await createJournal(body).unwrap();
      toast.success(response.message);
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save this journal."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[92vh] overflow-y-auto p-4 sm:max-w-xl sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update travel journal" : "Create travel journal"}
          </DialogTitle>
          <DialogDescription>
            Add the story and photos you want to remember.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
          <FloatingTextarea
            name="journal-body"
            label="Story"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            textareaClassName="min-h-44"
            required
          />
          <FloatingInput
            name="journal-tags"
            label="Tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Beach, Food, Solo Travel"
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-700">
              Who can see this journal?
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "public",
                  label: "Public",
                  description: "Anyone can read it",
                },
                {
                  value: "private",
                  label: "Private",
                  description: "Only you can read it",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    visibility === option.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                      : "border-slate-200 hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <input
                      type="radio"
                      name="journal-visibility"
                      value={option.value}
                      checked={visibility === option.value}
                      onChange={(event) => setVisibility(event.target.value)}
                      className="size-4 accent-primary"
                    />
                    {option.label}
                  </span>
                  <span className="mt-1 block pl-6 text-xs text-slate-500">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Images</p>
              <p className="text-xs text-slate-500">
                {visibleExistingImages.length + images.length}/4
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {visibleExistingImages.map((image) => (
                <ImageTile
                  key={image.id}
                  src={image.image_url}
                  onRemove={() =>
                    setRemovedImageIds((ids) => [...ids, image.id])
                  }
                />
              ))}
              {imagePreviews.map(({ file, url }) => (
                <ImageTile
                  key={`${file.name}-${file.lastModified}`}
                  src={url}
                  onRemove={() =>
                    setImages((current) =>
                      current.filter((image) => image !== file),
                    )
                  }
                />
              ))}
              {visibleExistingImages.length + images.length < 4 && (
                <label
                  htmlFor="journal-images"
                  className="center aspect-square cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-2 text-center text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  <ImagePlus size={20} />
                  Add image
                </label>
              )}
            </div>
            <Input
              id="journal-images"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const availableSlots =
                  4 - visibleExistingImages.length - images.length;
                const selected = Array.from(event.target.files).slice(
                  0,
                  availableSlots,
                );
                setImages((current) => [...current, ...selected]);
                event.target.value = "";
              }}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Journal"
                  : "Save Journal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ImageTile = ({ src, onRemove }) => (
  <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
    <img src={src} alt="Journal preview" className="h-full w-full object-cover" />
    <button
      type="button"
      onClick={onRemove}
      className="center absolute right-1.5 top-1.5 size-7 rounded-full bg-black/65 text-white transition hover:bg-black/80"
      aria-label="Remove image"
    >
      <X size={14} />
    </button>
  </div>
);

const JournalSkeleton = () => (
  <div className="grid gap-5">
    {Array.from({ length: 2 }).map((_, index) => (
      <div
        key={index}
        className="h-64 animate-pulse rounded-2xl bg-slate-100"
      />
    ))}
  </div>
);

export default TravelJournal;
