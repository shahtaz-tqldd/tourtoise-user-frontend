import { apiSlice } from "../api/apiSlice";

export const notificationListParams = ({
  page,
  page_size,
  ...params
} = {}) => {
  const query = new URLSearchParams();

  if (page !== undefined) query.set("page", String(page));
  if (page_size !== undefined) query.set("page_size", String(page_size));

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  return query.toString();
};

const notificationScopeTag = (params = {}) => ({
  type: "notification-list",
  id: JSON.stringify({
    trip_id: params.trip_id || "",
    type: params.type || "",
    unread_only: Boolean(params.unread_only),
  }),
});

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    notificationList: builder.query({
      query: (params = {}) => ({
        url: `/notifications/?${notificationListParams({
          page: 1,
          page_size: 20,
          ...params,
        })}`,
        method: "GET",
      }),
      providesTags: (result, error, params = {}) => [
        "notification-list",
        notificationScopeTag(params),
      ],
    }),

    readNotification: builder.mutation({
      query: ({ notification_id, trip_id }) => ({
        url: `/notifications/${notification_id}/read/${
          trip_id ? `?trip_id=${encodeURIComponent(trip_id)}` : ""
        }`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification-list", "profile-states"],
    }),

    readAllNotifications: builder.mutation({
      query: (params = {}) => ({
        url: `/notifications/read-all/?${notificationListParams(params)}`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification-list", "profile-states"],
    }),
  }),
});

export const {
  useNotificationListQuery,
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
} = notificationApiSlice;
