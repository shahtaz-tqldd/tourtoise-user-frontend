import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/layouts/root-layout";
import AppLayout from "@/layouts/app-layout";
import RequireAuth from "./require-auth";
import GuestOnly from "./guest-only";

// auth
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"));
const VerifyOTPPage = lazy(() => import("@/pages/auth/verify-otp"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const CreditHistoryPage = lazy(
  () => import("@/pages/profile/components/credit-history"),
);
const SettingsPage = lazy(() => import("@/pages/profile/components/settings"));

// destination
const DestiantionPage = lazy(() => import("@/pages/destinations"));
const DestinationDetailsPage = lazy(
  () => import("@/pages/destinations/destination-details"),
);
const DestinationFeatureListPage = lazy(
  () => import("@/pages/destinations/destination-features"),
);

// trips
const TripsPage = lazy(() => import("@/pages/trips"));
const TripDetailPage = lazy(() => import("@/pages/trips/trip-details"));
const PublicTripDetailsPage = lazy(
  () => import("@/pages/trips/public-trip-details"),
);

// journal
const TravelJournalPage = lazy(() => import("@/pages/journal"));
const JournalDetailsPage = lazy(
  () => import("@/pages/journal/journal-details"),
);

// others
const SavedItemsPage = lazy(() => import("@/pages/saved-items"));
const SearchPage = lazy(() => import("@/pages/search"));
const AppFeaturesPage = lazy(() => import("@/pages/app-features"));
const DesignSystemPage = lazy(() => import("@/pages/design-system"));


const withSuspense = (element) => (
  <Suspense fallback={null}>{element}</Suspense>
);

/** Member-only page: guests see a sign-in prompt and the auth modal. */
const member = (element, reason) =>
  withSuspense(<RequireAuth reason={reason}>{element}</RequireAuth>);

/** Standalone auth page: signed-in users are redirected away. */
const guest = (element) => withSuspense(<GuestOnly>{element}</GuestOnly>);

export const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // ---------- Public: discover places ----------
          { path: "/", element: withSuspense(<DestiantionPage />) },
          {
            path: "/destinations/:destination_id",
            element: withSuspense(<DestinationDetailsPage />),
          },
          {
            path: "/destinations/:destination_id/:feature_type",
            element: withSuspense(<DestinationFeatureListPage />),
          },
          { path: "/search", element: withSuspense(<SearchPage />) },
          { path: "/app-features", element: withSuspense(<AppFeaturesPage />) },
          { path: "/design-system", element: withSuspense(<DesignSystemPage />) },
          { path: "/travel-journal", element: withSuspense(<TravelJournalPage />) },
          {
            path: "/travel-journal/:journalId",
            element: withSuspense(<JournalDetailsPage />),
          },

          // ---------- Members: plan & travel ----------
          { path: "/trips", element: member(<TripsPage />, "trips") },
          { path: "/trips/:trip_id", element: member(<TripDetailPage />, "trips") },
          { path: "/saved-items", element: member(<SavedItemsPage />, "save") },
          { path: "/profile/credit-history", element: member(<CreditHistoryPage />) },
          { path: "/profile/settings", element: member(<SettingsPage />) },
          { path: "/profile/:username", element: member(<ProfilePage />) },
        ],
      },

      // ---------- Full-screen pages ----------
      { path: "/onboarding", element: member(<OnboardingPage />) },
      { path: "/login", element: guest(<LoginPage />) },
      { path: "/register", element: guest(<RegisterPage />) },
      // Not GuestOnly: verification signs the user in, then routes to onboarding.
      { path: "/verify-otp", element: withSuspense(<VerifyOTPPage />) },
      { path: "/forgot-password", element: guest(<ForgotPasswordPage />) },
      { path: "/reset-password", element: withSuspense(<ResetPasswordPage />) },
      {
        path: "/trip/public/:tripToken",
        element: withSuspense(<PublicTripDetailsPage />),
      },
    ],
  },
]);
