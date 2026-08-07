import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import {
  useCreateJournalMutation,
  useUpdateJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { createJournalFormData } from "../journal-utils";

const JournalFormDialog = ({ open, onOpenChange, journal }) => {
  const [content, setContent] = useState(journal?.body || "");
  const [visibility, setVisibility] = useState(journal?.visibility || "public");
  const [images, setImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [createJournal, { isLoading: isCreating }] = useCreateJournalMutation();
  const [updateJournal, { isLoading: isUpdating }] = useUpdateJournalMutation();
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

    const body = createJournalFormData({
      title: content.trim().split("\n")[0].slice(0, 200) || "Travel journal",
      content,
      visibility,
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
      <DialogContent className="custom-scrollbar max-h-screen h-screen md:h-fit overflow-x-hidden p-4 max-w-screen sm:max-w-xl sm:p-6 rounded-none md:rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update travel journal" : "Create travel journal"}
          </DialogTitle>
          <DialogDescription>
            Add the story and photos you want to remember.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
          <fieldset className="space-y-2">
            <div className="flex gap-6">
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
                  className="cursor-pointer transition select-none"
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
                </label>
              ))}
            </div>
          </fieldset>
          <FloatingTextarea
            name="journal-body"
            label="Story"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            textareaClassName="min-h-44 leading-7"
            required
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Images</p>
              <p className="text-xs text-slate-500">
                {visibleExistingImages.length + images.length}/4
              </p>
            </div>
            <div className="grid gap-3 grid-cols-4">
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
                  <span className="hidden md:block">Upload image</span>
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
    <img
      src={src}
      alt="Journal preview"
      className="h-full w-full object-cover"
    />
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

export default JournalFormDialog;
