import React, { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { apiSlice } from "@/features/api/apiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { AuthGateContext } from "../auth-gate-context";
import AuthModal from "./auth-modal";

// Same key the shared Dialog writes when it pushes a history entry
// (see src/hooks/useCloseOnBack.js).
const OVERLAY_HISTORY_KEY = "__tourtoiseOverlay";

// Data whose shape differs between guests and members (e.g. `is_saved`).
const PERSONALISED_TAGS = [
  "my-profile",
  "profile-states",
  "destination-list",
  "destination-detail",
  "saved-destination-list",
  "journal-list",
  "journal-detail",
];

/**
 * Closing the dialog calls `history.back()` to drop its history entry. Any
 * navigation started before that popstate lands would be undone, so follow-up
 * actions wait until the overlay entry is gone.
 */
const runAfterOverlayClosed = (callback) => {
  if (typeof window === "undefined") return;

  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.removeEventListener("popstate", onPopState);
    window.setTimeout(callback, 0);
  };
  const onPopState = () => run();

  if (window.history.state?.[OVERLAY_HISTORY_KEY]) {
    window.addEventListener("popstate", onPopState);
    window.setTimeout(run, 400); // fallback if popstate never arrives
  } else {
    run();
  }
};

/**
 * Owns the sign-in modal and exposes `requireAuth` / `openAuth` to the app.
 * Must render inside the router and the Redux provider.
 */
const AuthGateProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [state, setState] = useState({
    open: false,
    view: "login",
    reason: "default",
    email: "",
  });
  const pendingActionRef = useRef(null);

  const openAuth = useCallback((view = "login", reason = "default") => {
    setState((current) => ({ ...current, open: true, view, reason }));
  }, []);

  const closeAuth = useCallback(() => {
    pendingActionRef.current = null;
    setState((current) => ({ ...current, open: false }));
  }, []);

  const requireAuth = useCallback(
    (action, { reason = "default", view = "login" } = {}) => {
      if (isAuthenticated) {
        action?.();
        return true;
      }

      pendingActionRef.current = action || null;
      openAuth(view, reason);
      return false;
    },
    [isAuthenticated, openAuth],
  );

  const completeSignIn = useCallback(
    (tokens, followUp) => {
      dispatch(userLoggedIn(tokens));
      dispatch(apiSlice.util.invalidateTags(PERSONALISED_TAGS));

      const pendingAction = pendingActionRef.current;
      pendingActionRef.current = null;
      setState((current) => ({ ...current, open: false, email: "" }));

      const next = followUp || pendingAction;
      if (next) runAfterOverlayClosed(next);
    },
    [dispatch],
  );

  const handleAuthenticated = useCallback(
    (tokens) => completeSignIn(tokens),
    [completeSignIn],
  );

  // New accounts go through onboarding before anything else.
  const handleVerified = useCallback(
    (tokens) =>
      completeSignIn(tokens, () => navigate("/onboarding", { replace: true })),
    [completeSignIn, navigate],
  );

  const handleRegistered = useCallback((email) => {
    setState((current) => ({ ...current, view: "verify", email }));
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, requireAuth, openAuth, closeAuth }),
    [isAuthenticated, requireAuth, openAuth, closeAuth],
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <AuthModal
        open={state.open && !isAuthenticated}
        onOpenChange={(open) => (open ? null : closeAuth())}
        view={state.view}
        reason={state.reason}
        email={state.email}
        onSwitchView={(view) => setState((current) => ({ ...current, view }))}
        onAuthenticated={handleAuthenticated}
        onRegistered={handleRegistered}
        onVerified={handleVerified}
      />
    </AuthGateContext.Provider>
  );
};

export default AuthGateProvider;
