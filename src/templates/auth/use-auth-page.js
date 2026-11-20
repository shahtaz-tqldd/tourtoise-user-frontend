import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const switchView = useCallback(
    (view) => router.push(VIEW_PATHS[view] || "/login"),
    [router],
  );

  const signIn = useCallback(
    (tokens, to) => {
      dispatch(userLoggedIn(tokens));
      router.replace(to || "/");
    },
    [dispatch, router],
  );

  return { switchView, signIn, router };
};

export default useAuthPage;
