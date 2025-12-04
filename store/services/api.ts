import {
	BaseQueryApi,
	createApi,
	FetchArgs,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { getTokens } from "@/hooks/use-token";
import { userLoggedIn, userLoggedOut } from "../slices/auth-slice";
import { Store } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_ROUTE;
const MAX_RETRY_COUNT = 3;

// URLs that should skip token refresh logic
const SKIP_REAUTH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

const baseQuery = fetchBaseQuery({
	baseUrl: BASE_URL,
	prepareHeaders: (headers) => {
		const { accessToken } = getTokens();
		if (accessToken) {
			headers.set("Authorization", `Bearer ${accessToken}`);
		}
		return headers;
	},
	credentials: "include",
});

interface RefreshResponse {
	success: boolean;
	access_token: string;
	refresh_token: string;
	[key: string]: unknown;
}

const baseQueryWithReauth = async (
	args: string | FetchArgs,
	api: BaseQueryApi,
	extraOptions: Record<string, unknown>
) => {
	// Determine the URL from args
	const url = typeof args === 'string' ? args : args.url;

	// Skip reauth logic for login, register, and refresh endpoints
	if (SKIP_REAUTH_URLS.some(skipUrl => url.includes(skipUrl))) {
		return await baseQuery(args, api, extraOptions);
	}

	let result = await baseQuery(args, api, extraOptions);

	// Only attempt refresh if we get a 401 error
	if (result.error && result.error.status === 401) {
		const { refreshToken, rememberMe } = getTokens();
		let retryCount = 0;

		while (refreshToken && retryCount < MAX_RETRY_COUNT) {
			retryCount++;

			try {
				const refreshResult = await baseQuery(
					{
						url: "/auth/refresh",
						method: "POST",
						body: { refresh_token: refreshToken },
						credentials: "include",
					},
					api,
					extraOptions
				);

				// Check if refresh was successful
				if (refreshResult.data) {
					const refreshData = refreshResult.data as RefreshResponse;

					if (refreshData.success && refreshData.access_token && refreshData.refresh_token) {
						// Clear existing cache before logging in new user
						api.dispatch(apiSlice.util.resetApiState());

						// Update tokens in store
						api.dispatch(
							userLoggedIn({
								accessToken: refreshData.access_token,
								refreshToken: refreshData.refresh_token,
								rememberMe: rememberMe || false,
							})
						);

						// Retry the original request with new token
						result = await baseQuery(args, api, extraOptions);

						// If retry is successful, break the loop
						if (!result.error || result.error.status !== 401) {
							break;
						}
					} else {
						// Refresh failed, logout user
						api.dispatch(userLoggedOut());
						api.dispatch(apiSlice.util.resetApiState());
						break;
					}
				} else {
					// Refresh request failed, logout user
					api.dispatch(userLoggedOut());
					api.dispatch(apiSlice.util.resetApiState());
					break;
				}
			} catch (error) {
				console.error("Refresh token failed:", error);
				api.dispatch(userLoggedOut());
				api.dispatch(apiSlice.util.resetApiState());
				break;
			}
		}

		// If we've exhausted retries and still have a 401, logout
		if (retryCount >= MAX_RETRY_COUNT && result.error?.status === 401) {
			api.dispatch(userLoggedOut());
			api.dispatch(apiSlice.util.resetApiState());
		}
	}

	return result;
};

export const apiSlice = createApi({
	reducerPath: "apiSlice",
	baseQuery: baseQueryWithReauth,
	tagTypes: [
		"auth",
		"user",
	],
	keepUnusedDataFor: 30, // Keep data for 30 seconds
	refetchOnMountOrArgChange: true,
	refetchOnReconnect: true,
	refetchOnFocus: false, // Disable refetch on window focus to avoid unnecessary calls
	endpoints: () => ({}),
});

// Export utility functions for cache management
export const {
	util: { resetApiState },
} = apiSlice;

export const setupApiSlice = (store: Store) => {
	let previousAuthState: boolean | null = null;

	// Subscribe to store changes to handle user logout
	store.subscribe(() => {
		const state = store.getState() as { auth?: { isAuthenticated: boolean } };
		const currentAuthState = state.auth?.isAuthenticated ?? false;

		// Only reset API state when transitioning from authenticated to unauthenticated
		if (previousAuthState === true && currentAuthState === false) {
			store.dispatch(resetApiState());
		}

		previousAuthState = currentAuthState;
	});
};