import React from "react";

import { MobileBottomNavbarContext } from "@/components/navbar/mobile-bottom-navbar-context";

const useMobileBottomNavbar = ({ hidden = false } = {}) => {
  const context = React.useContext(MobileBottomNavbarContext);
  const requestId = React.useRef(Symbol("mobile-bottom-navbar-request"));

  if (!context) {
    throw new Error(
      "useMobileBottomNavbar must be used within MobileBottomNavbarProvider.",
    );
  }

  const { isHidden, requestHidden } = context;

  React.useLayoutEffect(() => {
    if (!hidden) return undefined;

    const id = requestId.current;
    requestHidden(id, true);

    return () => requestHidden(id, false);
  }, [hidden, requestHidden]);

  return { isHidden };
};

export default useMobileBottomNavbar;
