import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { resetApiState } from "@/features/api/apiSlice";
import { userLoggedOut } from "@/features/auth/authSlice";

/** Signs the user out, clears cached API data and returns to the home page. */
const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(() => {
    dispatch(userLoggedOut());
    dispatch(resetApiState());
    navigate("/", { replace: true });
  }, [dispatch, navigate]);
};

export default useLogout;
