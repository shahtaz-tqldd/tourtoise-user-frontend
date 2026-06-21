const journalDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export const normalizeJournal = (journal) => ({
  ...journal,
  body: journal.content || "",
  date: journal.created_at
    ? journalDateFormatter.format(new Date(journal.created_at))
    : "",
  imageRecords: journal.images || [],
  images: (journal.images || []).map((image) =>
    typeof image === "string" ? image : image.image_url,
  ),
});

export const normalizeJournals = (journals = []) =>
  journals.map(normalizeJournal);

export const createJournalFormData = ({
  title,
  content,
  visibility,
  tags,
  images = [],
  removeImageIds = [],
}) => {
  if (!images.length) {
    return {
      title: title.trim(),
      content: content.trim(),
      visibility,
      tags,
      ...(removeImageIds.length
        ? { remove_image_ids: removeImageIds }
        : {}),
    };
  }

  const formData = new FormData();
  formData.append("title", title.trim());
  formData.append("content", content.trim());
  formData.append("visibility", visibility);
  tags.forEach((tag) => formData.append("tags", tag));
  images.forEach((image) => formData.append("images", image));
  removeImageIds.forEach((id) => formData.append("remove_image_ids", id));
  return formData;
};
