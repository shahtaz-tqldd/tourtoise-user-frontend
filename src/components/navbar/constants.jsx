import {
  MapIcon,
  ChatIcon,
  JournalIcon,
  NoteIcon,
  SaveIcon,
} from "@/assets/icons/svg-icons";
import { DEFAULT_ICON_COLOR, PRIMARY_COLOR } from "@/constants/colors";
import {
  MapPinned,
  MessageSquareDot,
  Bookmark,
  History,
  Settings,
  Sparkles,
  CalendarDays,
  BookText,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    id: 1,
    label: "Tour Destinations",
    shortLabel: "Explore",
    link: "/",
    icon: ({ isActive }) => (
      <MapIcon size={5} color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR} />
    ),
    mobileIcon: MapPinned,
    isMobile: true,
  },
  {
    id: 2,
    label: "My Trips",
    shortLabel: "Trips",
    link: "/trips",
    icon: ({ isActive }) => (
      <NoteIcon
        size={5}
        color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
      />
    ),
    mobileIcon: CalendarDays,
    isMobile: true,
  },
  {
    id: 3,
    label: "Ask Turtle",
    shortLabel: "Agent",
    link: "/ask-turtle",
    icon: ({ isActive }) => (
      <ChatIcon
        size={5}
        color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
      />
    ),
    mobileIcon: MessageSquareDot,
    isMobile: true,
  },
  {
    id: 4,
    label: "Travel Journal",
    shortLabel: "Journal",
    link: "/travel-journal",
    icon: ({ isActive }) => (
      <JournalIcon
        size={5}
        color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
      />
    ),
    mobileIcon: BookText,
    isMobile: true,
  },
  {
    id: 5,
    label: "Saved Items",
    shortLabel: "Saved",
    link: "/saved-items",
    icon: ({ isActive }) => (
      <SaveIcon
        size={5}
        color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
      />
    ),
    isMobile: false,
  },
];

export const DRAWER_MENU_ITEMS = [
  {
    label: "Saved items",
    description: "Places and journals you saved",
    to: "/saved-items",
    icon: Bookmark,
    active: location.pathname.startsWith("/saved-items"),
  },
  {
    label: "Credit history",
    description: "See how your credits were used",
    to: "/profile/credit-history",
    icon: History,
    active: location.pathname.startsWith("/profile/credit-history"),
  },
  {
    label: "Profile settings",
    description: "Account, privacy and preferences",
    to: "/profile/settings",
    icon: Settings,
    active: location.pathname.startsWith("/profile/settings"),
  },
  {
    label: "App features",
    description: "Discover more ways to plan",
    to: "/app-features",
    icon: Sparkles,
    active: location.pathname.startsWith("/app-features"),
  },
];
