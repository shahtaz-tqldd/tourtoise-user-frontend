import React, { useCallback, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationList from "@/features/notification/notification-list";
import useNotificationSocket from "@/features/notification/useNotificationSocket";
import useNotificationAlert from "@/features/notification/useNotificationAlert";

const AlertMenu = ({ unreadCount = 0, onNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative center size-9 md:size-11 rounded-full border border-primary/10 bg-[#f8faf8] text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          aria-label="Open notifications"
        >
          <Bell className="size-4 md:size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 center size-5 rounded-full bg-red-600 text-[11px] font-bold leading-none text-white">
              {unreadCount > 20 ? "20+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(calc(100vw-2rem),24rem)] rounded-[24px] border-primary/10 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
      >
        <DropdownMenuLabel className="flex items-center gap-3 rounded-2xl bg-[#f7faf8] p-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-white">
            <BellRing className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-900">
              Notifications
            </span>
            <span className="mt-0.5 block text-xs font-normal text-slate-500">
              {unreadCount
                ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                : "All caught up"}
            </span>
          </span>
        </DropdownMenuLabel>
        {isAuthenticated && isOpen ? (
          <NotificationList
            pageSize={5}
            compact
            showHeader={false}
            className="pt-2"
            emptyMessage="No notifications available yet."
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

export default AlertMenu;
