"use client";

import AuthGateProvider from "@/features/auth/components/auth-gate-provider";
import ServerNotConnected from "@/components/shared/server-not-connected";
import useAuth from "@/hooks/useAuth";

/**
 * Top of the component tree. Loads the signed-in user's profile (if any) and
 * provides the auth gate (sign-in modal) to every page.
 */
const RootLayout = ({ children }) => {
  const { authError, isFetching, refetchProfile } = useAuth();

  if (authError) {
    return (
      <ServerNotConnected
        isFetching={isFetching}
        refetchProfile={refetchProfile}
      />
    );
  }

  return <AuthGateProvider>{children}</AuthGateProvider>;
};

export default RootLayout;
