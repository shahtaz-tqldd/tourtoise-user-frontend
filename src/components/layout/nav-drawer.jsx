import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useLogout from "@/features/auth/use-logout";
import ProfileBar from "./profile-bar";
import { CircleUserRound } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { Title } from "@/components/ui/typography";
import { DRAWER_MENU_ITEMS, GUEST_DRAWER_ITEMS } from "./nav-config";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/shared/utils";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

const NavDrawer = () => {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { openAuth } = useAuthGate();
  const menuItems = isAuthenticated ? DRAWER_MENU_ITEMS : GUEST_DRAWER_ITEMS;

  const username = user?.username;
  const fullName = user?.name;
  const profilePath = `/profile/${username || "my-profile"}`;
  const profileImage = user?.avatar_url;
  const isProfileActive = pathname === profilePath;

  const logout = useLogout();
  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={`group relative flex size-10 min-w-0 items-center justify-center rounded-full border-0 p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            isProfileActive ? "bg-primary/10" : "hover:bg-surface-muted/80"
          }`}
          aria-label={isAuthenticated ? "Open profile menu" : "Open menu"}
          aria-current={isProfileActive ? "page" : undefined}
        >
          {!isAuthenticated ? (
            <CircleUserRound className="size-6 text-body transition-transform group-active:scale-90" />
          ) : profileImage ? (
            <Image
              src={profileImage}
              width={40}
              alt={fullName}
              className={`size-8 rounded-full ring-2 transition-transform group-active:scale-90 ${
                isProfileActive ? "ring-primary/30" : "ring-line-subtle"
              }`}
              content_type={MEDIA_CONTENT_TYPE.USER}
            />
          ) : (
            <span
              className={`size-8 center rounded-full text-xs font-bold transition-transform group-active:scale-90 ${
                isProfileActive
                  ? "bg-primary text-white"
                  : "bg-primary/15 text-primary"
              }`}
            >
              {getInitials(fullName)}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showDragHandle={false}
        className="w-screen gap-0 overflow-hidden border-l-0 p-0 md:hidden bg-white"
      >
        <SheetTitle className="sr-only">Profile menu</SheetTitle>
        <SheetDescription className="sr-only">
          View your profile, saved items, and account settings.
        </SheetDescription>
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-emerald-50 via-amber-50/25 to-cyan-50">
          <header className="z-10 border-b border-line px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="mb-4 flex h-10 items-center gap-2">
              <SheetClose asChild>
                <button
                  type="button"
                  className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-body transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  aria-label="Close profile menu"
                >
                  <ArrowLeft className="size-5" />
                </button>
              </SheetClose>
              <Title>{isAuthenticated ? "Your profile" : "Menu"}</Title>
            </div>
            {isAuthenticated ? (
              <ProfileBar
                replace
                onClick={() => setOpen(false)}
                className="bg-surface"
              />
            ) : (
              <div className="rounded-2xl bg-surface p-4">
                <p className="font-display text-h4 text-heading">
                  Plan your next trip with Turtle
                </p>
                <p className="mt-1 text-caption text-subtle">
                  Sign in for AI itineraries, saved places and on-trip guidance.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      setOpen(false);
                      openAuth("login");
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      openAuth("register");
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            )}
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
            <p className="mb-2 mt-5 px-2 text-2xs font-semibold uppercase tracking-[0.12em] text-faint">
              {isAuthenticated ? "Your account" : "More from tourtoise"}
            </p>
            <nav className="space-y-1" aria-label="Profile menu links">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.label}
                    href={item.to}
                    replace
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
                      isActive
                        ? "text-primary"
                        : "text-body hover:bg-white hover:text-heading"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-primary/5 text-primary group-hover:text-primary"
                      }`}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="block truncate text-2xs text-faint">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto">
              {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="center w-full rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 bg-red-500/10"
              >
                Log out from tourtoise
              </button>
              )}
              <p className="text-xs text-center mt-4 text-subtle">
                tourtoise &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavDrawer;
