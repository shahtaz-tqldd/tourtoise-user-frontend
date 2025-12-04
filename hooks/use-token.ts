import { getAuthCookie, removeAuthCookie } from "./use-auth";

export const getTokens = () => {
	// SSR-safe: return null tokens
	if (typeof window === "undefined") {
		return {
			accessToken: null,
			refreshToken: null,
			rememberMe: false,
		};
	}

	const { accessToken: cookieAccessToken, refreshToken: cookieRefreshToken } =
		getAuthCookie();

	const sessionAccessToken = sessionStorage.getItem("tourtoise_access");
	const sessionRefreshToken = sessionStorage.getItem("tourtoise_refresh");

	if (cookieRefreshToken) {
		return {
			accessToken: cookieAccessToken,
			refreshToken: cookieRefreshToken,
			rememberMe: true,
		};
	}

	return {
		accessToken: sessionAccessToken,
		refreshToken: sessionRefreshToken,
		rememberMe: false,
	};
};


export const clearTokens = () => {
	if (typeof window !== "undefined") {
		sessionStorage.removeItem("tourtoise_access");
		sessionStorage.removeItem("tourtoise_refresh");
	}

	removeAuthCookie();
};


export const setSessionToken = (accessToken: string, refreshToken: string) => {
	if (typeof window === "undefined") return;

	sessionStorage.setItem("tourtoise_access", accessToken);
	sessionStorage.setItem("tourtoise_refresh", refreshToken);
};
