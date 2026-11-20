import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { resetApiState } from "@/features/api/apiSlice";
import { userLoggedOut } from "@/features/auth/authSlice";

/** Signs the user out, clears cached API data and returns to the home page. */
const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  return useCallback(() => {
    dispatch(userLoggedOut());
    dispatch(resetApiState());
    router.replace("/");
  }, [dispatch, router]);
};

export default useLogout;
