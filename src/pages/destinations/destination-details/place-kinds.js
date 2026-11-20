import { Activity, Landmark, Utensils } from "lucide-react";

import { MEDIA_CONTENT_TYPE } from "@/constants/content";
import { formatLabel } from "@/lib/utils";

const formatHours = (hours) =>
  Number(hours) > 0 ? `${hours} hr${Number(hours) === 1 ? "" : "s"}` : null;

/** Per-kind copy and the one or two facts each card shows. */
export const PLACE_KINDS = {
  attractions: {
    title: "Top attractions",
    description: "Places worth making time for",
    featureTitle: "Attraction",
    icon: Landmark,
    contentType: MEDIA_CONTENT_TYPE.ATTRACTION,
    getType: (item) => item.attraction_type,
    getMeta: (item) => [item.address],
  },
  activities: {
    title: "Things to do",
    description: "Experiences to add to your days",
    featureTitle: "Activity",
    icon: Activity,
    contentType: MEDIA_CONTENT_TYPE.ACTIVITY,
    getType: (item) => item.activity_type,
    getMeta: (item) => [
      formatHours(item.duration_hours),
      item.booking_required ? "Book ahead" : null,
    ],
  },
  cuisines: {
    title: "Food to try",
    description: "Local dishes worth ordering",
    featureTitle: "Cuisine",
    icon: Utensils,
    contentType: MEDIA_CONTENT_TYPE.CUISINE,
    getType: (item) => item.cuisine_type,
    getMeta: (item) => [
      formatLabel(item.meal_type),
      item.is_vegetarian_friendly ? "Veg friendly" : null,
    ],
  },
};
