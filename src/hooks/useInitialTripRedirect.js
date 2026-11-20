import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { INITIAL_REDIRECT_SESSION_KEY } from "@/constants/session";
import { useProfileStatesQuery } from "@/features/auth/authApiSlice";

const useInitialTripRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const handledRef = useRef(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { data, isSuccess } = useProfileStatesQuery(undefined, {
    skip: !isAuthenticated,
  });

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
    if (pathname !== tripPath) {
      router.replace(tripPath);
    }
  }, [data, isSuccess, pathname, router]);
};

export default useInitialTripRedirect;
