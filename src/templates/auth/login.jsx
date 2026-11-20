"use client";

import { useSearchParams } from "next/navigation";
import AuthContainer from "./components/container";
import LoginForm from "@/features/auth/components/login-form";
import useAuthPage from "./use-auth-page";

const LoginPage = () => {
  const { switchView, signIn } = useAuthPage();
  const searchParams = useSearchParams();

  return (
    <AuthContainer
      title="Welcome back"
      description="Sign in to plan trips with Turtle and pick up where you left off."
    >
      <LoginForm
        onAuthenticated={(tokens) => signIn(tokens)}
        onSwitchView={switchView}
        successMessage={searchParams?.get("message") || undefined}
      />
    </AuthContainer>
  );
};

export default LoginPage;
