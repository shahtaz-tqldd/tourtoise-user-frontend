import React, { useCallback, useMemo } from "react";
import { ArrowUpRight, Bell, CheckCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn, titleCase } from "@/lib/utils";
import { duration } from "@/lib/date-time";
import {
  useNotificationListQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} from "./notificationApiSlice";
import useNotificationSocket from "./useNotificationSocket";

const getNotifications = (response) => response?.data || [];
const getUnreadCount = (response) => response?.meta?.unread_count || 0;

const isNotificationInScope = (notification, scopeParams = {}) => {
  if (!notification) return true;
  if (scopeParams.trip_id && notification.trip_id !== scopeParams.trip_id) {
    return false;
  }
  if (scopeParams.type && notification.notification_type !== scopeParams.type) {
    return false;
  }
  return true;
};

const NotificationListSkeleton = ({ compact }) => (
  <div
    className="space-y-2"
    role="status"
    aria-label="Loading notifications"
  >
    {Array.from({ length: compact ? 3 : 5 }, (_, index) => (
      <div
        key={index}
        className="flex animate-pulse items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3"
      >
        <span className="size-9 shrink-0 rounded-full bg-slate-200" />
        <span className="min-w-0 flex-1 space-y-2 py-1">
          <span className="block h-3 w-2/5 rounded-full bg-slate-200" />
          <span className="block h-3 w-full rounded-full bg-slate-100" />
          <span className="block h-3 w-3/4 rounded-full bg-slate-100" />
          <span className="block h-2.5 w-1/4 rounded-full bg-slate-100" />
        </span>
      </div>
    ))}
    <span className="sr-only">Loading notifications...</span>
  </div>
);

const NotificationList = ({
  scopeParams = {},
  pageSize = 20,
  className = "",
  itemClassName = "",
  emptyMessage = "No notifications available yet.",
  showHeader = true,
  compact = false,
  onAction,
}) => {
  const scopeKey = JSON.stringify(scopeParams);
  const scopedParams = useMemo(() => JSON.parse(scopeKey), [scopeKey]);
  const queryArgs = useMemo(
    () => ({
      page: 1,
      page_size: pageSize,
      ...scopedParams,
    }),
    [pageSize, scopedParams],
  );

  const { data, isFetching, isError, refetch } =
    useNotificationListQuery(queryArgs);
  const [readNotification, { isLoading: isReading }] =
    useReadNotificationMutation();
  const [readAllNotifications, { isLoading: isReadingAll }] =
    useReadAllNotificationsMutation();

  const notifications = getNotifications(data);
  const unreadCount = getUnreadCount(data);

  const handleSocketNotification = useCallback(
    (notification) => {
      if (isNotificationInScope(notification, scopedParams)) {
        refetch();
      }
    },
    [refetch, scopedParams],
  );

  useNotificationSocket({ onNotification: handleSocketNotification });

  const markRead = useCallback(
    async (notification) => {
      if (!notification?.id || notification.is_read || isReading) return;

      try {
        await readNotification({
          notification_id: notification.id,
          trip_id: scopedParams.trip_id,
        }).unwrap();
      } catch {
        toast.error("Could not mark notification as read.");
      }
    },
    [isReading, readNotification, scopedParams.trip_id],
  );

  const markAllRead = useCallback(async () => {
    if (!unreadCount || isReadingAll) return;

    try {
      await readAllNotifications(scopedParams).unwrap();
    } catch {
      toast.error("Could not mark notifications as read.");
    }
  }, [isReadingAll, readAllNotifications, scopedParams, unreadCount]);

  return (
    <div className={cn("min-h-0", className)}>
      {showHeader && (
        <div className="mb-5">
          <button
            type="button"
            onClick={markAllRead}
            disabled={!unreadCount || isReadingAll}
            className="flx gap-1.5 text-sm font-semibold text-primary transition hover:text-emerald-700 disabled:opacity-45"
          >
            {isReadingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            Mark all read
          </button>
        </div>
      )}

      <div
        className={cn(
          "hidden-scrollbar min-h-0 space-y-2 overflow-y-auto overscroll-contain",
          compact ? "max-h-[22rem]" : "h-full",
        )}
      >
        {isError && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load notifications.
          </p>
        )}

        {!isError &&
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={cn(
                "overflow-hidden rounded-2xl border text-left transition hover:bg-primary/5",
                notification.is_read
                  ? "border-slate-100 bg-slate-50"
                  : "border-primary/15 bg-white shadow-sm",
                itemClassName,
              )}
            >
              <button
                type="button"
                onClick={() => markRead(notification)}
                className="block w-full p-3 text-left"
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                      notification.is_read
                        ? "bg-slate-100 text-slate-500"
                        : "bg-primary text-white",
                    )}
                  >
                    <Bell className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0 text-sm font-semibold text-slate-950">
                        {notification.title}
                      </span>
                      {!notification.is_read && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-[#ffcf36]" />
                      )}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">
                      {notification.message}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>
                        {titleCase(notification.notification_type) ||
                          "Notification"}
                      </span>
                      <span aria-hidden="true">.</span>
                      <span>{duration(notification.created_at)}</span>
                    </span>
                  </span>
                </span>
              </button>

              {notification.metadata?.show_app_feature ? (
                <div className="border-t border-slate-100 px-3 py-2">
                  <Link
                    to="/app-features"
                    onClick={() => {
                      void markRead(notification);
                      onAction?.();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
                  >
                    Explore Tourtoise features
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </article>
          ))}

        {!isError && !notifications.length && !isFetching && (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
            {emptyMessage}
          </p>
        )}

        {isFetching && !notifications.length && (
          <NotificationListSkeleton compact={compact} />
        )}

        {isFetching && notifications.length > 0 && (
          <p className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Loading notifications...
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
