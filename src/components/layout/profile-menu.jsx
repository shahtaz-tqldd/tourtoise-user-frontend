import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Image } from "@/components/shared/utils";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";
import useLogout from "@/features/auth/use-logout";
import { getInitials } from "@/lib/utils";
import { DRAWER_MENU_ITEMS } from "./nav-config";

const Avatar = ({ user, className = "size-9" }) =>
  user?.avatar_url ? (
    <Image
      src={user.avatar_url}
      width={80}
      alt=""
      className={`${className} rounded-full`}
      content_type={MEDIA_CONTENT_TYPE.USER}
    />
  ) : (
    <span
      className={`${className} center shrink-0 rounded-full bg-primary/15 text-caption font-bold text-primary`}
    >
      {getInitials(user?.name)}
    </span>
  );

/** Desktop account menu (avatar → profile, saved items, settings, logout). */
const ProfileMenu = () => {
  const user = useSelector((state) => state.auth.user);
  const logout = useLogout();
  const isPremium = user?.status === "PREMIUM";
  const profilePath = `/profile/${user?.username || "my-profile"}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden p-1 rounded-full border border-line bg-surface transition hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:flex"
          aria-label="Open account menu"
        >
          <Avatar user={user} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-2xl border-line bg-surface p-2 shadow-overlay"
      >
        <DropdownMenuLabel className="p-0">
          <Link
            href={profilePath}
            className="flex items-center gap-3 rounded-xl bg-surface-subtle p-3 transition hover:bg-accent"
          >
            <Avatar user={user} className="size-11" />
            <span className="min-w-0">
              <span className="block truncate text-body-sm font-semibold text-heading">
                {user?.name || "Traveler"}
              </span>
              <span className="mt-0.5 block truncate text-caption font-medium text-subtle">
                {isPremium
                  ? "Premium member"
                  : `${user?.credit ?? 0} credits left`}
              </span>
            </span>
          </Link>
        </DropdownMenuLabel>

        <div className="py-1">
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg px-3 py-2.5"
          >
            <Link href={profilePath}>
              <UserRound className="size-4 text-primary" />
              <span className="text-body-sm font-medium text-heading">
                My profile
              </span>
            </Link>
          </DropdownMenuItem>
          {DRAWER_MENU_ITEMS.map(({ label, to, icon: Icon }) => (
            <DropdownMenuItem
              key={to}
              asChild
              className="cursor-pointer rounded-lg px-3 py-2.5"
            >
              <Link href={to}>
                <Icon className="size-4 text-primary" />
                <span className="text-body-sm font-medium text-heading">
                  {label}
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-line-subtle" />
        <DropdownMenuItem
          onSelect={logout}
          className="cursor-pointer rounded-lg px-3 py-2.5 text-danger focus:bg-danger-soft focus:text-danger"
        >
          <LogOut className="size-4 text-danger" />
          <span className="text-body-sm font-semibold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
