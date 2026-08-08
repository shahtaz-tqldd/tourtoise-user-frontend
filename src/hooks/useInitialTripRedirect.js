import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { INITIAL_REDIRECT_SESSION_KEY } from "@/constants/session";
import { useProfileStatesQuery } from "@/features/auth/authApiSlice";

const useInitialTripRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handledRef = useRef(false);
  const { data, isSuccess } = useProfileStatesQuery();

  useEffect(() => {
    if (!isSuccess || handledRef.current) return;

    try {
      if (window.sessionStorage.getItem(INITIAL_REDIRECT_SESSION_KEY)) {
        handledRef.current = true;
        return;
      }
    } catch {
      // The in-memory guard still prevents repeated redirects when storage is
      // unavailable.
    }

    handledRef.current = true;

    try {
      window.sessionStorage.setItem(INITIAL_REDIRECT_SESSION_KEY, "true");
    } catch {
      // Browsers can disable session storage; redirecting once is still safe.
    }

    const profileStates = data?.data ?? data;
    const tripId = profileStates?.in_progress_trip?.trip_id;
    if (!tripId) return;

    const tripPath = `/trips/${tripId}`;
    if (location.pathname !== tripPath) {
      navigate(tripPath, { replace: true });
    }
  }, [data, isSuccess, location.pathname, navigate]);
};

export default useInitialTripRedirect;
