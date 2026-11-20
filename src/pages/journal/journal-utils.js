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
  tags = [],
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

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
  style: "short",
});

const RELATIVE_STEPS = [
  ["minute", 60],
  ["hour", 60 * 60],
  ["day", 60 * 60 * 24],
  ["week", 60 * 60 * 24 * 7],
];

/** "5 min. ago", "yesterday", "3 wk. ago"; older than ~4 weeks → a date. */
export const formatTimeAgo = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "just now";
  if (abs > 60 * 60 * 24 * 28) return journalDateFormatter.format(date);

  const [unit, size] =
    [...RELATIVE_STEPS].reverse().find(([, step]) => abs >= step) ||
    RELATIVE_STEPS[0];
  return relativeFormatter.format(Math.round(seconds / size), unit);
};

const GENERIC_TITLES = new Set(["travel journal", ""]);

/**
 * Older posts store the story's first line as the title. Show the title once
 * as a heading and drop the duplicated line from the body.
 */
export const getJournalTitleAndBody = (journal) => {
  const title = String(journal?.title || "").trim();
  const body = String(journal?.body ?? journal?.content ?? "").trim();
  if (GENERIC_TITLES.has(title.toLowerCase())) return { title: "", body };

  const [firstLine, ...rest] = body.split("\n");
  const firstLineText = firstLine.trim();
  if (firstLineText && (firstLineText === title || firstLineText.slice(0, 200) === title)) {
    return { title: firstLineText, body: rest.join("\n").trim() };
  }

  return { title, body };
};

export const getJournalTags = (journal) =>
  (Array.isArray(journal?.tags) ? journal.tags : [])
    .map((tag) => (typeof tag === "string" ? tag : tag?.name))
    .filter(Boolean);
