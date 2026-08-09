import React, { useCallback, useState } from "react";
import { ArrowLeft, Bell, BellRing, X } from "lucide-react";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NotificationList from "@/features/notification/notification-list";
import useNotificationSocket from "@/features/notification/useNotificationSocket";
import useNotificationAlert from "@/features/notification/useNotificationAlert";
import { useMediaQuery } from "@/lib/mobile-visible";

const NotificationTrigger = React.forwardRef(function NotificationTrigger(
  { unreadCount, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className="relative center size-9 rounded-full border border-primary/10 bg-[#f8faf8] text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 md:size-11"
      aria-label="Open notifications"
      {...props}
    >
      <Bell className="size-4 md:size-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 center size-5 rounded-full bg-red-600 text-[11px] font-bold leading-none text-white">
          {unreadCount > 20 ? "20+" : unreadCount}
        </span>
      )}
    </button>
  );
});

const NotificationSummary = ({ unreadCount, mobile = false }) => (
  <div
    className={
      mobile
        ? "flex min-w-0 items-center gap-3"
        : "flex items-center gap-3 rounded-2xl bg-[#f7faf8] p-3"
    }
  >
    <span className="hidden md:inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
      <BellRing className="size-4" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-slate-900">
        Notifications
      </span>
      <span className="mt-0.5 block truncate text-xs font-normal text-slate-500">
        {unreadCount
          ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
          : "All caught up"}
      </span>
    </span>
  </div>
);

const NotificationMenu = ({ unreadCount = 0, onNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const showNotificationAlert = useNotificationAlert({
    enabled: user?.is_alert_notification_enabled !== false,
  });
  const handleSocketNotification = useCallback(
    (notification) => {
      onNotification?.();
      showNotificationAlert(notification);
    },
    [onNotification, showNotificationAlert],
  );

  useNotificationSocket({
    enabled: isAuthenticated,
    onNotification: handleSocketNotification,
  });

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <NotificationTrigger unreadCount={unreadCount} />
        </SheetTrigger>
        <SheetContent
          side="right"
          showDragHandle={false}
          className="w-screen gap-0 overflow-hidden border-l-0 bg-white p-0 md:hidden"
        >
          <SheetTitle className="sr-only">Notifications</SheetTitle>
          <SheetDescription className="sr-only">
            View your recent notifications.
          </SheetDescription>

          <header className="flx gap-2 border-b border-slate-100 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <SheetClose asChild>
              <button
                type="button"
                className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                aria-label="Close profile menu"
              >
                <ArrowLeft className="size-5" />
              </button>
            </SheetClose>
            <NotificationSummary unreadCount={unreadCount} mobile />
          </header>

          <div className="flex min-h-0 flex-1 flex-col p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {isAuthenticated && isOpen ? (
              <NotificationList
                pageSize={20}
                showHeader={false}
                className="flex min-h-0 flex-1 flex-col"
                emptyMessage="No notifications available yet."
                onAction={() => setIsOpen(false)}
              />
            ) : !isAuthenticated ? (
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
                Sign in to see notifications.
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <NotificationTrigger unreadCount={unreadCount} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(calc(100vw-2rem),24rem)] rounded-[24px] border-primary/10 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
      >
        <DropdownMenuLabel className="p-0">
          <NotificationSummary unreadCount={unreadCount} />
        </DropdownMenuLabel>
        {isAuthenticated && isOpen ? (
          <NotificationList
            pageSize={5}
            compact
            showHeader={false}
            className="pt-2"
            emptyMessage="No notifications available yet."
            onAction={() => setIsOpen(false)}
          />
        ) : !isAuthenticated ? (
          <p className="m-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
            Sign in to see notifications.
          </p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
