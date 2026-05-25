import { setAuthCookie } from "@/hooks/useCookie";
import { clearTokens, getTokens, setSessionToken } from "@/hooks/useToken";
import { createSlice } from "@reduxjs/toolkit";

const { accessToken } = getTokens();

const initialState = {
  accessToken: accessToken || null,
  user: null,
  isAuthenticated: !!accessToken,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      if (action.payload.rememberMe) {
        setAuthCookie(action.payload);
      } else {
        setSessionToken(
          action.payload.accessToken,
          action.payload.refreshToken
        );
      }
    },
    userDetailsFetched: (state, action) => {
      state.user = action.payload;
    },
    userLoggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      clearTokens();
    },
  },
});

export const { userLoggedIn, userDetailsFetched, userLoggedOut } =
  authSlice.actions;

export default authSlice.reducer;
