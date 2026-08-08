import React from "react";

import { MobileBottomNavbarContext } from "./mobile-bottom-navbar-context";

const hiddenRequestReducer = (state, action) => {
  const nextState = new Set(state);

  if (action.type === "hide") nextState.add(action.id);
  if (action.type === "show") nextState.delete(action.id);

  return nextState;
};

const MobileBottomNavbarProvider = ({ children }) => {
  const [hiddenRequests, dispatch] = React.useReducer(
    hiddenRequestReducer,
    new Set(),
  );

  const requestHidden = React.useCallback((id, hidden) => {
    dispatch({ type: hidden ? "hide" : "show", id });
  }, []);

  const value = React.useMemo(
    () => ({
      isHidden: hiddenRequests.size > 0,
      requestHidden,
    }),
    [hiddenRequests, requestHidden],
  );

  return (
    <MobileBottomNavbarContext.Provider value={value}>
      {children}
    </MobileBottomNavbarContext.Provider>
  );
};

export default MobileBottomNavbarProvider;
