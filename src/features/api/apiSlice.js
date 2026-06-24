import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "@/features/auth/authSlice";
import { getTokens } from "@/hooks/useToken";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const MAX_RETRY_COUNT = 3;

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const { accessToken, refreshToken, rememberMe } = getTokens();
  let retryCount = 0;

  while (
    (!accessToken || (result.error && result.error.status === 401)) &&
    retryCount < MAX_RETRY_COUNT
  ) {
    retryCount++;
    try {
      if (refreshToken) {
        const refreshResult = await baseQuery(
          {
            url: "/accounts/refresh/",
            method: "POST",
            body: { refresh_token: refreshToken },
            credentials: "include",
          },
          api,
          extraOptions
        );

        if (refreshResult.data?.success) {
          const refreshData = refreshResult?.data?.data || {};
          api.dispatch(
            userLoggedIn({
              accessToken:
                refreshData.access_token || refreshData.accessToken,
              refreshToken:
                refreshData.refresh_token || refreshData.refreshToken || refreshToken,
              rememberMe,
            })
          );

          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
          break;
        } else {
          api.dispatch(userLoggedOut());
          // api.dispatch(apiSlice.util.resetApiState());
          break;
        }
      } else {
        api.dispatch(userLoggedOut());
        // api.dispatch(apiSlice.util.resetApiState());
        break;
      }
    } catch (error) {
      console.error("Refresh token failed:", error);
      api.dispatch(userLoggedOut());
      // api.dispatch(apiSlice.util.resetApiState());
      break;
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "auth",
    "my-profile",
    "destination-list",
    "destination-detail",
    "saved-destination-list",
    "trip-list",
    "trip-detail",
    "accommodation-type",
    "transport-type",
    "activity-type",
    "journal-list",
    "my-journal-list",
    "saved-journal-list",
    "journal-detail",
    "journal-comments",
    "journal-replies",
    "chat-session-list",
    "chat-session",
    "chat-message-list",
  ],
  keepUnusedDataFor: 300, // Don't keep any unused data
  refetchOnMountOrArgChange: false, // Always refetch when component mounts
  refetchOnReconnect: true, // Refetch on reconnection
  endpoints: () => ({}),
});

// Export utility functions for cache management
export const {
  util: { resetApiState },
} = apiSlice;
