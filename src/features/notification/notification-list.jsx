import React, { useCallback, useMemo, useState } from "react";
import { ArrowUpRight, Bell, CheckCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import EmptyItems from "@/components/shared/empty-items";
import { cn, titleCase } from "@/lib/utils";
import { duration } from "@/lib/date-time";
import {
  useNotificationListQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} from "./notificationApiSlice";
import useNotificationSocket from "./useNotificationSocket";
import { Text, Title } from "@/components/ui/typography";
import TripNotificationDetails from "./trip-notification-details";

const getNotifications = (response) => response?.data || [];
const getUnreadCount = (response) => response?.meta?.unread_count || 0;
const tripDetailEventTypes = new Set([
  "packing_reminder",
  "trip_started",
  "daily_summary",
]);

const hasTripNotificationDetails = (notification) =>
  tripDetailEventTypes.has(notification?.metadata?.event_type);

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
  <div className="space-y-2" role="status" aria-label="Loading notifications">
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
  onNotificationRead,
  onAllNotificationsRead,
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
  const [selectedNotification, setSelectedNotification] = useState(null);

  const notifications = getNotifications(data);
  const unreadCount = getUnreadCount(data);
  const isTripScoped = Boolean(scopedParams.trip_id);

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
        onNotificationRead?.(notification);
      } catch {
        toast.error("Could not mark notification as read.");
      }
    },
    [isReading, onNotificationRead, readNotification, scopedParams.trip_id],
  );

  const markAllRead = useCallback(async () => {
    if (!unreadCount || isReadingAll) return;

    try {
      await readAllNotifications(scopedParams).unwrap();
      onAllNotificationsRead?.();
    } catch {
      toast.error("Could not mark notifications as read.");
    }
  }, [
    isReadingAll,
    onAllNotificationsRead,
    readAllNotifications,
    scopedParams,
    unreadCount,
  ]);

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
          notifications.map((notification) => {
            const showsAppFeature = Boolean(
              notification.metadata?.show_app_feature,
            );
            const isTripNotification =
              notification.notification_type === "trip" &&
              Boolean(notification.trip_id);
            const hasLink =
              !isTripScoped && (showsAppFeature || isTripNotification);
            const hasDetails =
              isTripScoped && hasTripNotificationDetails(notification);
            const link = showsAppFeature
              ? "/app-features"
              : `/trips/${notification.trip_id}?tab=notification`;
            const label = showsAppFeature
              ? "Let's see what Tourtoise is about"
              : "View your trip";

            return (
              <article
                key={notification.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl border text-left transition",
                  notification.is_read
                    ? "border-slate-200 bg-slate-50"
                    : "border-primary/20 bg-primary/10 hover:bg-primary/15",
                  itemClassName,
                )}
              >
                {hasDetails ? (
                  <button
                    type="button"
                    onClick={() => {
                      void markRead(notification);
                      setSelectedNotification(notification);
                    }}
                    className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-label={`View details for ${notification.title}`}
                  />
                ) : hasLink ? (
                  <Link
                    to={link}
                    onClick={() => {
                      void markRead(notification);
                      onAction?.();
                    }}
                    className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-label={`${label}: ${notification.title}`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => markRead(notification)}
                    className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-label={`Mark ${notification.title} as read`}
                  />
                )}

                <div className="p-3">
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
                        <Title
                          variant="xxs"
                          className={cn(
                            !notification?.is_read ? "text-slate-900" : "",
                          )}
                        >
                          {notification.title}
                        </Title>

                        {!notification.is_read && (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </span>
                      <Text
                        variant="sm"
                        className={cn(
                          "mt-2 leading-6",
                          !notification?.is_read ? "text-slate-800" : "",
                        )}
                      >
                        {notification.message}
                      </Text>

                      {hasDetails ? (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 underline underline-offset-4">
                          View details
                        </span>
                      ) : hasLink ? (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 underline underline-offset-4">
                          {label}
                          <ArrowUpRight
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}

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
                </div>
              </article>
            );
          })}

        {!isError && !notifications.length && !isFetching && (
          <EmptyItems
            icon={Bell}
            title={emptyMessage}
            description="New updates and activity will appear here."
            className={cn(compact && "min-h-36 py-6")}
          />
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

      <TripNotificationDetails
        notification={selectedNotification}
        onOpenChange={(open) => {
          if (!open) setSelectedNotification(null);
        }}
      />
    </div>
  );
};

export default NotificationList;
