import { formatLabel } from "@/lib/utils";

/** Cover first, then the gallery in sort order, without duplicate URLs. */
export const getDestinationPhotos = (destination) => {
  const gallery = (destination?.images || [])
    .map((image) => ({
      url: image?.image_url,
      caption: image?.caption,
      sortOrder: image?.sort_order ?? 0,
    }))
    .filter((image) => image.url)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const photos = destination?.cover_image
    ? [{ url: destination.cover_image, caption: "" }, ...gallery]
    : gallery;

  const seen = new Set();
  return photos.filter((photo) => {
    if (seen.has(photo.url)) return false;
    seen.add(photo.url);
    return true;
  });
};

/** Tags arrive as strings or `{ name, slug }` objects. */
export const getTagLabel = (tag) =>
  typeof tag === "string" ? formatLabel(tag) : tag?.name || formatLabel(tag?.slug);
