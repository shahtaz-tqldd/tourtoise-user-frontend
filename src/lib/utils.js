import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
