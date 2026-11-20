import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { userLoggedIn } from "@/features/auth/authSlice";

const VIEW_PATHS = {
  login: "/login",
  register: "/register",
  forgot: "/forgot-password",
  verify: "/verify-otp",
};

/** Shared wiring for the standalone auth pages. */
const useAuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const switchView = useCallback(
    (view) => navigate(VIEW_PATHS[view] || "/login", { state: location.state }),
    [location.state, navigate],
  );

  const signIn = useCallback(
    (tokens, to) => {
      dispatch(userLoggedIn(tokens));
      navigate(to || location.state?.from?.pathname || "/", { replace: true });
    },
    [dispatch, location.state, navigate],
  );

  return { switchView, signIn, location, navigate };
};

export default useAuthPage;
