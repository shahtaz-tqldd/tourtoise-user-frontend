import { decodeJWT } from "@/lib/jwt-decoder";

interface AuthTokens {
	accessToken: string;
	refreshToken?: string;
}

export const setAuthCookie = (auth: AuthTokens, name = "tourtoise", path = "/") => {
	if (typeof document === "undefined") return; // <-- SSR SAFE
	if (typeof window === "undefined") return;

	const { accessToken, refreshToken } = auth;

	const { exp } = decodeJWT(accessToken);
	const ms = exp ? exp * 1000 - Date.now() : 0;

	let cookieFlags = "; SameSite=Strict";
	if (process.env.PROD) cookieFlags += "; Secure";

	const accessExpires = new Date(Date.now() + ms);
	document.cookie = `${name}_access=${accessToken}; expires=${accessExpires.toUTCString()}; path=${path}${cookieFlags}`;

	if (refreshToken) {
		const refreshExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
		document.cookie = `${name}_refresh=${refreshToken}; expires=${refreshExpires.toUTCString()}; path=${path}${cookieFlags}`;
	}

	localStorage.setItem(`${name}_exp`, exp.toString());
};

export const getAuthCookie = (name = "tourtoise") => {
	if (typeof document === "undefined") {
		return { accessToken: null, refreshToken: null, isExpired: true };
	}

	if (typeof window === "undefined") {
		return { accessToken: null, refreshToken: null, isExpired: true };
	}

	const getCookie = (cookieName: string) => {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${cookieName}=`);
		if (parts.length === 2) {
			return parts.pop()?.split(";").shift() ?? null;
		}
		return null;
	};

	const accessToken = getCookie(`${name}_access`);
	const refreshToken = getCookie(`${name}_refresh`);
	const tokenExp = localStorage.getItem(`${name}_exp`);

	const isExpired = tokenExp && parseInt(tokenExp) * 1000 < Date.now();

	return {
		accessToken: isExpired ? null : accessToken,
		refreshToken,
		isExpired,
	};
};


export const removeAuthCookie = (name = "tourtoise", path = "/") => {
	if (typeof document === "undefined") return;
	if (typeof window === "undefined") return;

	const cookieFlags = process.env.PROD
		? "; Secure; SameSite=Strict"
		: "; SameSite=Strict";

	document.cookie = `${name}_access=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${cookieFlags}`;
	document.cookie = `${name}_refresh=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${cookieFlags}`;

	localStorage.removeItem(`${name}_exp`);
};


// New function to check if user is authenticated
export const isAuthenticated = (name = "tourtoise") => {
	const { accessToken, refreshToken, isExpired } = getAuthCookie(name);

	if (!accessToken && !refreshToken) {
		return false;
	}

	if (isExpired && !refreshToken) {
		return false;
	}

	return true;
};