import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom scales from src/styles/tokens.css. Without
// this, e.g. `text-h2` (a size) and `text-heading` (a color) are both read as
// colors and one silently overrides the other.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-xl",
        "display-lg",
        "display",
        "h1",
        "h2",
        "h3",
        "h4",
        "body-lg",
        "body-md",
        "body-sm",
        "caption",
        "overline",
        "2xs",
        "3xs",
      ],
      radius: ["control", "card", "sheet"],
      shadow: ["card", "raised", "overlay", "brand"],
      container: ["page", "prose"],
      spacing: ["gutter", "section"],
      font: ["display"],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const fallbackValue = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

export const getInitials = (name) =>
  fallbackValue(name, "Guest User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const titleCase = (value) =>
  value
    ? value
        .toString()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";

export const formatLabel = (value) => value?.replaceAll("_", " ") || "N/A";

export const getCloudinaryPreviewUrl = (url, width = 300) => {
  if (!url?.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const uploadPath = "/image/upload/";
  const [baseUrl, imagePath] = url.split(uploadPath);

  if (!baseUrl || !imagePath) return url;
  if (imagePath.startsWith("c_scale,")) return url;

  return `${baseUrl}${uploadPath}c_scale,w_${width}/${imagePath}`;
};
