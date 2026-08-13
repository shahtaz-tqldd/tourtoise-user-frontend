import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, MessageCircle, PlaneTakeoff, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { Logo } from "../shared/utils";
import { useProfileStatesQuery } from "@/features/auth/authApiSlice";
import { formatDateRange } from "@/lib/date-time";
import NotificationMenu from "./components/notification-menu";
import { Header } from "../ui/container";

const formatUnreadCount = (count) => (count > 99 ? "99+" : count);

const MainHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = React.useState(() => {
    if (location.pathname !== "/search") return "";

    return new URLSearchParams(location.search).get("q") || "";
  });

  const navigateToSearch = React.useCallback(() => {
    const params = new URLSearchParams(location.search);
    const trimmedSearch = searchQuery.trim();

    if (trimmedSearch) params.set("q", trimmedSearch);
    else params.delete("q");

    if (!params.get("tab")) params.set("tab", "destinations");

    navigate({
      pathname: "/search",
      search: `?${params.toString()}`,
    });
  }, [location.search, navigate, searchQuery]);

  const { data, refetch: refetchProfileStates } = useProfileStatesQuery();
  const profileStates = data?.data ?? data;
  const inProgressTrip = profileStates?.in_progress_trip;
  const unreadNotificationCount = profileStates?.unread_notification ?? 0;
  const tripUnreadNotificationCount = Number(
    inProgressTrip?.unread_notification || 0,
  );
  const tripUnreadMessageCount = Number(inProgressTrip?.unread_message || 0);

  return (
    <Header>
      <Logo className="flex md:hidden" />
      <form
        className="relative hidden min-w-0 max-w-xl flex-1 md:block"
        onSubmit={(event) => {
          event.preventDefault();
          navigateToSearch();
        }}
      >
        <span className="sr-only">Search feed</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary/55" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search destinations, tour plans and posts"
          className="h-11 rounded-full border-primary/15 bg-[#fcfdfb] pl-11 pr-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {inProgressTrip?.trip_id && (
          <Link
            to={`/trips/${inProgressTrip.trip_id}`}
            className="group relative flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white text-primary transition hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 md:h-11 md:w-auto md:max-w-[22rem] md:justify-start md:gap-3 md:px-2"
            aria-label={`Open in-progress trip ${inProgressTrip.name}. ${tripUnreadNotificationCount} unread notifications and ${tripUnreadMessageCount} unread messages.`}
          >
            <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 md:size-8">
              <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping">
                <span />
              </span>

              <PlaneTakeoff className="size-4" />
            </span>
            <span className="hidden min-w-0 text-left leading-tight md:block">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {inProgressTrip.name}
              </span>
              <span className="block truncate text-[11px] font-medium text-slate-500">
                {formatDateRange(
                  inProgressTrip.start_date,
                  inProgressTrip.end_date,
                )}
              </span>
            </span>
            <div className="flx gap-1">
              {tripUnreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white md:static md:h-7 md:min-w-0 md:gap-1 md:bg-amber-50 md:px-2 md:text-[11px] md:leading-none md:text-amber-700 md:ring-0">
                  <Bell className="hidden size-3 md:block" />
                  {formatUnreadCount(tripUnreadNotificationCount)}
                  <span className="sr-only"> trip notifications</span>
                </span>
              )}

              {tripUnreadMessageCount > 0 && (
                <span className="absolute -bottom-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-sky-600 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white md:static md:h-7 md:min-w-0 md:gap-1 md:bg-sky-50 md:px-2 md:text-[11px] md:leading-none md:text-sky-700 md:ring-0">
                  <MessageCircle className="hidden size-3 md:block" />
                  {formatUnreadCount(tripUnreadMessageCount)}
                  <span className="sr-only"> trip messages</span>
                </span>
              )}
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={navigateToSearch}
          className="size-9 md:size-11 items-center justify-center rounded-full border border-primary/10 bg-[#f8faf8] text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 flex md:hidden"
          aria-label="Search"
        >
          <Search className="size-4 md:size-5" />
        </button>
        <NotificationMenu
          unreadCount={unreadNotificationCount}
          onNotification={refetchProfileStates}
        />
      </div>
    </Header>
  );
};

export default MainHeader;
