import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/main";
import PrivateRoute from "./private-route";

import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";

import DestiantionPage from "@/pages/destinations";
import DestinationDetailPage from "@/pages/destinations/destination-detail";

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
        element: <DestiantionPage />,
      },
      {
        path: "/destinations/:destination_id",
        element: <DestinationDetailPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);
