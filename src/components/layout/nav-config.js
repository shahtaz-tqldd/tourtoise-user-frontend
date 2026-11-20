import {
  MapPinned,
  Bookmark,
  History,
  Settings,
  Sparkles,
  CalendarDays,
  BookText,
  Palette,
} from "lucide-react";

/**
 * Primary navigation, ordered by the product journey:
 *   discover → get inspired (public) → plan & travel (members).
 * `requiresAuth` items stay linked for guests — the route shows a sign-in
 * prompt and opens the auth modal. `hideForGuests` items are hidden entirely
 * when signed out.
 * `inTopNav` → desktop header links; `isMobile` → mobile bottom tab bar.
 */
export const NAV_ITEMS = [
  {
    id: "explore",
    label: "Destinations",
    shortLabel: "Explore",
    link: "/",
    mobileIcon: MapPinned,
    inTopNav: true,
    isMobile: true,
  },
  {
    id: "journal",
    label: "Travel Journal",
    shortLabel: "Journal",
    link: "/travel-journal",
    mobileIcon: BookText,
    inTopNav: true,
    isMobile: true,
  },
  {
    id: "trips",
    label: "My Trips",
    shortLabel: "Trips",
    link: "/trips",
    mobileIcon: CalendarDays,
    inTopNav: true,
    isMobile: true,
    requiresAuth: true,
    hideForGuests: true,
  },
];

export const isNavItemActive = (link, pathname) => {
  if (link === "/") return pathname === "/" || pathname.startsWith("/destinations/");
  return pathname === link || pathname.startsWith(`${link}/`);
};

export const DRAWER_MENU_ITEMS = [
  {
    label: "Saved items",
    description: "Places and journals you saved",
    to: "/saved-items",
    icon: Bookmark,
  },
  {
    label: "Credit history",
    description: "See how your credits were used",
    to: "/profile/credit-history",
    icon: History,
  },
  {
    label: "Profile settings",
    description: "Account, privacy and preferences",
    to: "/profile/settings",
    icon: Settings,
  },
  {
    label: "App features",
    description: "Discover more ways to plan",
    to: "/app-features",
    icon: Sparkles,
  },
];

export const GUEST_DRAWER_ITEMS = [
  {
    label: "App features",
    description: "How tourtoise helps you travel",
    to: "/app-features",
    icon: Sparkles,
  },
  {
    label: "Design system",
    description: "Colors, type and components",
    to: "/design-system",
    icon: Palette,
  },
];
