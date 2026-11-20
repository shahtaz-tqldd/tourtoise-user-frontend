import {
  Building2,
  Footprints,
  Landmark,
  Mountain,
  Palmtree,
  Sprout,
  Umbrella,
} from "lucide-react";

export const DESTINATION_TYPE_OPTIONS = [
  { value: "city", label: "City", icon: Building2 },
  { value: "beach", label: "Beach", icon: Umbrella },
  { value: "mountain", label: "Mountain", icon: Mountain },
  { value: "cultural", label: "Cultural", icon: Landmark },
  { value: "nature", label: "Nature", icon: Sprout },
  { value: "island", label: "Island", icon: Palmtree },
  { value: "village", label: "Village", icon: Footprints },
];

/** Single-select chips on the landing page ("all" = no type filter). */
export const DESTINATION_CHIP_OPTIONS = [
  { value: "all", label: "All" },
  { value: "beach", label: "Beach" },
  { value: "city", label: "City" },
  { value: "nature", label: "Nature" },
  { value: "cultural", label: "Cultural" },
  { value: "mountain", label: "Mountain" },
];

/** Card grid: 1 / 2 / 3 / 4 columns. */
export const DESTINATION_GRID_CLASS =
  "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
