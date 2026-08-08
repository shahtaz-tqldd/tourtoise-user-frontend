import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/main";
import PrivateRoute from "./private-route";

// auth
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"));
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

// chat
const AgentChatPage = lazy(() => import("@/pages/chat"));

// journal
const TravelJournalPage = lazy(() => import("@/pages/journal"));
const JournalDetailsPage = lazy(
  () => import("@/pages/journal/journal-details"),
);

// others
const SavedItemsPage = lazy(() => import("@/pages/saved-items"));
const SearchPage = lazy(() => import("@/pages/search"));
const AppFeaturesPage = lazy(() => import("@/pages/app-features"));

const withSuspense = (element) => (
  <Suspense fallback={null}>{element}</Suspense>
);

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: withSuspense(<DestiantionPage />),
      },
      {
        path: "/destinations/:destination_id",
        element: withSuspense(<DestinationDetailsPage />),
      },
      {
        path: "/destinations/:destination_id/:feature_type",
        element: withSuspense(<DestinationFeatureListPage />),
      },
      {
        path: "/trips",
        element: withSuspense(<TripsPage />),
      },
      {
        path: "/trips/:trip_id",
        element: withSuspense(<TripDetailPage />),
      },
      {
        path: "/ask-turtle",
        element: withSuspense(<AgentChatPage />),
      },
      {
        path: "/travel-journal",
        element: withSuspense(<TravelJournalPage />),
      },
      {
        path: "/travel-journal/:journalId",
        element: withSuspense(<JournalDetailsPage />),
      },
      {
        path: "/saved-items",
        element: withSuspense(<SavedItemsPage />),
      },
      {
        path: "/search",
        element: withSuspense(<SearchPage />),
      },
      {
        path: "/profile/:username",
        element: withSuspense(<ProfilePage />),
      },
      {
        path: "/profile/credit-history",
        element: withSuspense(<CreditHistoryPage />),
      },
      {
        path: "/profile/settings",
        element: withSuspense(<SettingsPage />),
      },
    ],
  },
  {
    path: "/login",
    element: withSuspense(<LoginPage />),
  },
  {
    path: "/register",
    element: withSuspense(<RegisterPage />),
  },
  {
    path: "/forgot-password",
    element: withSuspense(<ForgotPasswordPage />),
  },
  {
    path: "/reset-password",
    element: withSuspense(<ResetPasswordPage />),
  },
  {
    path: "/trip/public/:tripToken",
    element: withSuspense(<PublicTripDetailsPage />),
  },
  {
    path: "/app-features",
    element: withSuspense(<AppFeaturesPage />),
  },
]);
