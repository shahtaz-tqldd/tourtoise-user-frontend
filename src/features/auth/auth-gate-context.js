import { createContext, useContext } from "react";

export const AuthGateContext = createContext(null);

/**
 * Access the sign-in gate.
 *
 *   const { requireAuth, openAuth } = useAuthGate();
 *   requireAuth(() => setPlanningOpen(true), { reason: "plan" });
 *
 * `requireAuth` runs the action immediately for signed-in users; for guests it
 * opens the auth modal and runs the action after a successful sign-in.
 */
export const useAuthGate = () => {
  const context = useContext(AuthGateContext);

  if (!context) {
    throw new Error("useAuthGate must be used inside <AuthGateProvider>.");
  }

  return context;
};

/** Copy shown in the auth modal depending on what the guest tried to do. */
export const AUTH_REASONS = {
  default: {
    title: "Welcome to tourtoise",
    description:
      "Sign in to plan trips with Turtle, save places and keep your journal.",
  },
  plan: {
    title: "Plan this trip with Turtle",
    description:
      "Create a free account and Turtle will build a day-by-day itinerary for you.",
  },
  save: {
    title: "Save it for later",
    description: "Sign in to build your bucket list and come back to it anytime.",
  },
  trips: {
    title: "Your trips live here",
    description:
      "Sign in to see your plans and get on-trip guidance while you travel.",
  },
  journal: {
    title: "Share your travel stories",
    description: "Sign in to write, save and react on travel journals.",
  },
};

/** Heading copy for each step of the auth modal. */
export const AUTH_VIEW_COPY = {
  login: {
    title: "Welcome back",
    description: "Sign in to continue your journey.",
  },
  register: {
    title: "Create your account",
    description: "It's free — start planning in under a minute.",
  },
  verify: {
    title: "Verify your email",
    description: "Enter the 4-digit code we just sent you.",
  },
  forgot: {
    title: "Reset your password",
    description: "We'll email you a link to set a new one.",
  },
};
