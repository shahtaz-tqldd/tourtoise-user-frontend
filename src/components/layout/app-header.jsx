import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageCircle, PlaneTakeoff, Search, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Logo } from "../shared/utils";
import { useProfileStatesQuery } from "@/features/auth/authApiSlice";
import { formatDateRange } from "@/lib/date-time";
import NotificationMenu from "./notification-menu";
import TopNav from "./top-nav";
import ProfileMenu from "./profile-menu";
import { Header } from "../ui/container";
import useHeroInView from "@/hooks/useHeroInView";

const formatUnreadCount = (count) => (count > 99 ? "99+" : count);

const AppHeader = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { openAuth } = useAuthGate();
  const router = useRouter();
  const pathname = usePathname();
  // Landing hero has its own primary CTA: keep one green button at a time.
  const isLanding = pathname === "/";
  const heroInView = useHeroInView();
  const showPlanCta = !(isLanding && heroInView);
  const [searchQuery, setSearchQuery] = React.useState(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/search")
      return "";

    return new URLSearchParams(window.location.search).get("q") || "";
  });

  const navigateToSearch = React.useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const trimmedSearch = searchQuery.trim();

    if (trimmedSearch) params.set("q", trimmedSearch);
    else params.delete("q");

    if (!params.get("tab")) params.set("tab", "destinations");

    router.push(`/search?${params.toString()}`);
  }, [router, searchQuery]);

  const { data, refetch: refetchProfileStates } = useProfileStatesQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const profileStates = data?.data ?? data;
  const inProgressTrip = profileStates?.in_progress_trip;
  const unreadNotificationCount = profileStates?.unread_notification ?? 0;
  const tripUnreadNotificationCount = Number(
    inProgressTrip?.unread_notification || 0,
  );
  const tripUnreadMessageCount = Number(inProgressTrip?.unread_message || 0);

  return (
    <Header>
      <Logo className="flex shrink-0" />
      <TopNav className="ml-2 lg:ml-6" />

      <form
        role="search"
        className="relative ml-auto hidden w-full min-w-0 max-w-64 xl:block 2xl:max-w-80"
        onSubmit={(event) => {
          event.preventDefault();
          navigateToSearch();
        }}
      >
        <label htmlFor="header-search" className="sr-only">
          Search
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary/55" />
        <Input
          id="header-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={
            isAuthenticated ? "Search places, trips…" : "Search destinations"
          }
          className="h-11 rounded-full border-line bg-surface-subtle pl-11 pr-4 text-sm shadow-none hover:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
        {inProgressTrip?.trip_id && (
          <Link
            href={`/trips/${inProgressTrip.trip_id}`}
            className="group relative flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white text-primary transition hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 xl:h-11 xl:w-auto xl:max-w-[22rem] xl:justify-start xl:gap-3 xl:px-2"
            aria-label={`Open in-progress trip ${inProgressTrip.name}. ${tripUnreadNotificationCount} unread notifications and ${tripUnreadMessageCount} unread messages.`}
          >
            <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 xl:size-8">
              <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping">
                <span />
              </span>

              <PlaneTakeoff className="size-4" />
            </span>
            <span className="hidden min-w-0 text-left leading-tight xl:block">
              <span className="block truncate text-sm font-semibold text-heading">
                {inProgressTrip.name}
              </span>
              <span className="block truncate text-2xs font-medium text-subtle">
                {formatDateRange(
                  inProgressTrip.start_date,
                  inProgressTrip.end_date,
                )}
              </span>
            </span>
            <div className="flx gap-1">
              {tripUnreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white xl:static xl:h-7 xl:min-w-0 xl:gap-1 xl:bg-amber-50 xl:px-2 xl:text-2xs xl:leading-none xl:text-amber-700 xl:ring-0">
                  <Bell className="hidden size-3 xl:block" />
                  <span>{formatUnreadCount(tripUnreadNotificationCount)}</span>
                  <span className="sr-only"> trip notifications</span>
                </span>
              )}

              {tripUnreadMessageCount > 0 && (
                <span className="absolute -bottom-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white xl:static xl:h-7 xl:min-w-0 xl:gap-1 xl:bg-red-50 xl:px-2 xl:text-2xs xl:leading-none xl:text-red-700 xl:ring-0">
                  <MessageCircle className="hidden size-3 xl:block" />
                  <span>{formatUnreadCount(tripUnreadMessageCount)}</span>
                  <span className="sr-only"> trip messages</span>
                </span>
              )}
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={navigateToSearch}
          className="size-9 md:size-11 items-center justify-center rounded-full border border-primary/10 bg-surface-subtle text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 flex xl:hidden"
          aria-label="Search"
        >
          <Search className="size-4 md:size-5" />
        </button>
        {isAuthenticated ? (
          <>
            <NotificationMenu
              unreadCount={unreadNotificationCount}
              onNotification={refetchProfileStates}
            />
            <ProfileMenu />
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className={cn(
                "h-9 rounded-full px-4 md:inline-flex md:h-11",
                showPlanCta && "hidden",
              )}
              onClick={() => openAuth("login")}
            >
              Sign in
            </Button>
            {showPlanCta && (
            <Button
              className="h-9 rounded-full px-4 shadow-brand animate-in fade-in-0 duration-200 md:h-11 md:px-5"
              onClick={() => openAuth("register", "plan")}
            >
              <Sparkles aria-hidden="true" />
              <span className="md:hidden">Join</span>
              <span className="hidden lg:inline">Plan a trip free</span>
              <span className="hidden md:inline lg:hidden">Join</span>
            </Button>
            )}
          </>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;
