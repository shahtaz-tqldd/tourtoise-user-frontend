import React, { useEffect, useId, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Globe2, Hash, ImagePlus, Lock, X } from "lucide-react";

import PreviewContent from "@/components/shared/preview-content";
import { Button } from "@/components/ui/button";
import {
  useCreateJournalMutation,
  useUpdateJournalMutation,
} from "@/features/journal/journalApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import AuthorAvatar from "./author-avatar";
import {
  createJournalFormData,
  getJournalTags,
  getJournalTitleAndBody,
} from "../journal-utils";

const MAX_IMAGES = 4;
const MAX_TAGS = 5;
const MAX_TITLE = 120;

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe2 },
  { value: "private", label: "Only me", icon: Lock },
];

const normalizeTag = (value) =>
  value.replace(/^#/, "").trim().replace(/\s+/g, " ").slice(0, 30);

const JournalFormDialog = ({ open, onOpenChange, journal }) => {
  const user = useSelector((state) => state.auth.user);
  const ids = useId();
  const isEditing = Boolean(journal);
  const initial = useMemo(() => getJournalTitleAndBody(journal), [journal]);

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.body);
  const [visibility, setVisibility] = useState(journal?.visibility || "public");
  const [tags, setTags] = useState(() => getJournalTags(journal));
  const [tagDraft, setTagDraft] = useState("");
  const [images, setImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [createJournal, { isLoading: isCreating }] = useCreateJournalMutation();
  const [updateJournal, { isLoading: isUpdating }] = useUpdateJournalMutation();
  const isSubmitting = isCreating || isUpdating;

  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );
  useEffect(
    () => () => imagePreviews.forEach(({ url }) => URL.revokeObjectURL(url)),
    [imagePreviews],
  );

  const existingImages = (journal?.imageRecords || []).filter(
    (image) => !removedImageIds.includes(image.id),
  );
  const imageCount = existingImages.length + images.length;
  const canPost = content.trim().length > 0 && !isSubmitting;

  const addTag = (raw) => {
    const tag = normalizeTag(raw);
    setTagDraft("");
    if (!tag || tags.length >= MAX_TAGS) return;
    if (tags.some((current) => current.toLowerCase() === tag.toLowerCase())) return;
    setTags((current) => [...current, tag]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canPost) return;

    const finalTags = tagDraft.trim() ? [...tags, normalizeTag(tagDraft)] : tags;
    const body = createJournalFormData({
      title:
        title.trim() ||
        content.trim().split("\n")[0].slice(0, 200) ||
        "Travel journal",
      content,
      visibility,
      tags: finalTags.filter(Boolean).slice(0, MAX_TAGS),
      images,
      removeImageIds: removedImageIds,
    });

    try {
      const response = isEditing
        ? await updateJournal({ journal_id: journal.id, body }).unwrap()
        : await createJournal(body).unwrap();
      toast.success(response?.message || (isEditing ? "Post updated." : "Post shared."));
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save this post."));
    }
  };

  const heading = isEditing ? "Edit your post" : "Share a travel story";

  return (
    <PreviewContent
      open={open}
      onOpenChange={(next) => !isSubmitting && onOpenChange(next)}
      title={heading}
      description="Write about a trip and add up to four photos."
      className="h-fit sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[88dvh] flex-col">
        {/* Header */}
        <div className="flbx gap-3 border-b border-line-subtle px-5 py-4">
          <h2 className="font-display text-h4 text-heading">{heading}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="center size-9 rounded-full text-subtle hover:bg-surface-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* Author + audience */}
          <div className="flex items-center gap-3">
            <AuthorAvatar src={user?.avatar_url} name={user?.name} />
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold text-heading">
                {user?.name || "You"}
              </p>
              <fieldset className="mt-1">
                <legend className="sr-only">Who can see this post</legend>
                <div className="inline-flex rounded-full bg-surface-muted p-0.5">
                  {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={cn(
                        "flx cursor-pointer gap-1 rounded-full px-2.5 py-1 text-caption font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                        visibility === value
                          ? "bg-surface text-heading shadow-card"
                          : "text-subtle hover:text-heading",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${ids}-visibility`}
                        value={value}
                        checked={visibility === value}
                        onChange={() => setVisibility(value)}
                        className="sr-only"
                      />
                      <Icon className="size-3.5" aria-hidden="true" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          {/* Title */}
          <label htmlFor={`${ids}-title`} className="sr-only">
            Title
          </label>
          <input
            id={`${ids}-title`}
            value={title}
            maxLength={MAX_TITLE}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give it a title (optional)"
            className="mt-5 w-full bg-transparent font-display text-h3 text-heading outline-none placeholder:text-faint"
          />

          {/* Story */}
          <label htmlFor={`${ids}-story`} className="sr-only">
            Your story
          </label>
          <textarea
            id={`${ids}-story`}
            value={content}
            required
            rows={6}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Where did you go? What should the next traveler know — best spots, costs, what you'd skip?"
            className="field-sizing-content mt-2 min-h-36 w-full resize-none bg-transparent text-body-md text-body outline-none placeholder:text-faint"
          />

          {/* Photos */}
          {imageCount > 0 && (
            <ul role="list" className="mt-3 grid grid-cols-4 gap-2">
              {existingImages.map((image) => (
                <ImageTile
                  key={image.id}
                  src={image.image_url}
                  onRemove={() => setRemovedImageIds((current) => [...current, image.id])}
                />
              ))}
              {imagePreviews.map(({ file, url }) => (
                <ImageTile
                  key={`${file.name}-${file.lastModified}`}
                  src={url}
                  onRemove={() => setImages((current) => current.filter((item) => item !== file))}
                />
              ))}
            </ul>
          )}

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl bg-surface-subtle px-3 py-2 ring-1 ring-line-subtle focus-within:ring-2 focus-within:ring-ring/60">
            <Hash className="size-4 text-faint" aria-hidden="true" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="flx gap-1 rounded-full bg-accent py-0.5 pl-2.5 pr-1 text-caption font-semibold text-brand-text"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                  className="center size-4 rounded-full hover:bg-brand-100"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            ))}
            {tags.length < MAX_TAGS && (
              <>
                <label htmlFor={`${ids}-tags`} className="sr-only">
                  Add tags
                </label>
                <input
                  id={`${ids}-tags`}
                  value={tagDraft}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value.endsWith(",")) addTag(value.slice(0, -1));
                    else setTagDraft(value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag(tagDraft);
                    } else if (event.key === "Backspace" && !tagDraft && tags.length) {
                      setTags((current) => current.slice(0, -1));
                    }
                  }}
                  onBlur={() => tagDraft && addTag(tagDraft)}
                  placeholder={tags.length ? "Add another" : "Add tags — Hanoi, street food, budget…"}
                  className="min-w-32 flex-1 bg-transparent py-0.5 text-body-sm text-heading outline-none placeholder:text-faint"
                />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flbx gap-3 border-t border-line-subtle bg-surface px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flx gap-2">
            <label
              htmlFor={`${ids}-images`}
              aria-disabled={imageCount >= MAX_IMAGES}
              className={cn(
                "flx h-10 cursor-pointer gap-2 rounded-full px-3 text-body-sm font-semibold text-brand-text transition hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                imageCount >= MAX_IMAGES && "pointer-events-none opacity-50",
              )}
            >
              <ImagePlus className="size-5" aria-hidden="true" />
              Photos
              <input
                id={`${ids}-images`}
                type="file"
                multiple
                accept="image/*"
                disabled={imageCount >= MAX_IMAGES}
                className="sr-only"
                onChange={(event) => {
                  const selected = Array.from(event.target.files || []).slice(
                    0,
                    MAX_IMAGES - imageCount,
                  );
                  setImages((current) => [...current, ...selected]);
                  event.target.value = "";
                }}
              />
            </label>
            <span className="text-caption text-subtle">
              {imageCount}/{MAX_IMAGES}
            </span>
          </div>

          <Button type="submit" disabled={!canPost} className="h-10 rounded-full px-6">
            {isSubmitting ? "Posting…" : isEditing ? "Save changes" : "Post"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

const ImageTile = ({ src, onRemove }) => (
  <li className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted">
    <img src={src} alt="" className="size-full object-cover" />
    <button
      type="button"
      onClick={onRemove}
      className="center absolute right-1 top-1 size-6 rounded-full bg-ink-950/65 text-white transition hover:bg-ink-950/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      aria-label="Remove photo"
    >
      <X className="size-3.5" aria-hidden="true" />
    </button>
  </li>
);

export default JournalFormDialog;
