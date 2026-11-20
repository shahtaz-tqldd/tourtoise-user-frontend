import { getAuthCookie, removeAuthCookie } from "./useCookie";

const isBrowser = typeof window !== "undefined";

export const getTokens = () => {
  // Called at module init by authSlice: must stay safe during SSR/prerender.
  if (!isBrowser) {
    return { accessToken: null, refreshToken: null, rememberMe: false };
  }

  const { accessToken: cookieAccessToken, refreshToken: cookieRefreshToken } =
    getAuthCookie();

  const sessionAccessToken = sessionStorage.getItem("tourtoise_access");
  const sessionRefreshToken = sessionStorage.getItem("tourtoise_refresh");

  if (cookieAccessToken || cookieRefreshToken) {
    return {
      accessToken: cookieAccessToken,
      refreshToken: cookieRefreshToken,
      rememberMe: true,
    };
  } else {
    return {
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
      rememberMe: false,
    };
  }
};

export const clearTokens = () => {
  sessionStorage.removeItem("tourtoise_access");
  sessionStorage.removeItem("tourtoise_refresh");
  removeAuthCookie();
};

export const setSessionToken = (accessToken, refreshToken) => {
  sessionStorage.setItem("tourtoise_access", accessToken);
  sessionStorage.setItem("tourtoise_refresh", refreshToken);
};
