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
