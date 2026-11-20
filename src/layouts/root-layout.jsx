import { Outlet } from "react-router-dom";

import AuthGateProvider from "@/features/auth/components/auth-gate-provider";
import ServerNotConnected from "@/components/shared/server-not-connected";
import useAuth from "@/hooks/useAuth";

/**
 * Top of the route tree. Loads the signed-in user's profile (if any) and
 * provides the auth gate (sign-in modal) to every page.
 */
const RootLayout = () => {
  const { authError, isFetching, refetchProfile } = useAuth();

  if (authError) {
    return (
      <ServerNotConnected
        isFetching={isFetching}
        refetchProfile={refetchProfile}
      />
    );
  }

  return (
    <AuthGateProvider>
      <Outlet />
    </AuthGateProvider>
  );
};

export default RootLayout;
