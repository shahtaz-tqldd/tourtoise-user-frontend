import {
  Armchair,
  Backpack,
  BedSingle,
  Building2,
  Crown,
  Gem,
  Heart,
  Hotel,
  House,
  Shuffle,
  Sparkles,
  UserRound,
  Users,
  UsersRound,
  WalletCards,
} from "lucide-react";

export const TRAVELLER_TYPE_OPTIONS = [
  { value: "solo", label: "Solo", icon: UserRound },
  { value: "couple", label: "Couple", icon: Heart },
  { value: "family", label: "Family", icon: UsersRound },
  { value: "group", label: "Group", icon: Users },
];

export const BUDGET_TIER_OPTIONS = [
  { value: "backpacker", label: "Backpacker", icon: Backpack },
  { value: "budget", label: "Budget", icon: WalletCards },
  { value: "comfort", label: "Comfort", icon: Armchair },
  { value: "premium", label: "Premium", icon: Sparkles },
  { value: "luxury", label: "Luxury", icon: Gem },
];

export const ACCOMMODATION_OPTIONS = [
  { value: "budget", label: "Budget stays", icon: BedSingle },
  { value: "mid_range", label: "Mid Range", icon: Hotel },
  { value: "boutique", label: "Boutique stays", icon: Building2 },
  { value: "luxury", label: "Luxury hotels", icon: Crown },
  { value: "apartment", label: "Apartment / villa", icon: House },
  { value: "hostel", label: "Hostel", icon: Backpack },
  { value: "any", label: "Flexible", icon: Shuffle },
];

export const TRAVEL_PACE_OPTIONS = [
  {
    value: "relaxed",
    label: "Relaxed",
    description: "Fewer activities, more rest time, slower movement.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Balanced plan with enough activities and breathing room.",
  },
  {
    value: "packed",
    label: "Packed",
    description: "More attractions and activities per day.",
  },
];

export const TRAVEL_INTEREST_OPTIONS = [
  "Food",
  "History",
  "Nature",
  "Nightlife",
  "Adventure",
  "Shopping",
  "Culture",
  "Beaches",
  "Photography",
  "Local experiences",
  "Family-friendly activities",
  "Luxury experiences",
  "Hidden gems",
];

export const DIETARY_OPTIONS = [
  "No restriction",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Seafood allergy",
  "Nut allergy",
  "Avoid pork",
  "Other",
];

export const MOBILITY_OPTIONS = [
  "No mobility constraints",
  "Avoid long walking",
  "Avoid stairs",
  "Wheelchair-friendly places preferred",
  "Senior-friendly plan",
  "Kid-friendly pacing",
  "Avoid intense physical activities",
  "Other",
];
