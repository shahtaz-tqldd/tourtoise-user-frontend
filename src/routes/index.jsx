import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/main";
import PrivateRoute from "./private-route";

const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"));

const DestiantionPage = lazy(() => import("@/pages/destinations"));
const DestinationDetailsPage = lazy(
  () => import("@/pages/destinations/destination-details")
);
const DestinationFeatureListPage = lazy(
  () => import("@/pages/destinations/destination-features")
);
const TripsPage = lazy(() => import("@/pages/trips"));
const TripDetailPage = lazy(() => import("@/pages/trips/trip-details"));
const AgentChatPage = lazy(() => import("@/pages/chat"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const TravelJournalPage = lazy(() => import("@/pages/journal"));

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
        path: "/agent-chat",
        element: withSuspense(<AgentChatPage />),
      },
      {
        path: "/travel-journal",
        element: withSuspense(<TravelJournalPage />),
      },
      {
        path: "/profile/:username",
        element: withSuspense(<ProfilePage />),
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
]);
