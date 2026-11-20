"use client";

import AuthContainer from "./components/container";
import RegisterForm from "@/features/auth/components/register-form";
import useAuthPage from "./use-auth-page";

const RegisterPage = () => {
  const { switchView, signIn, router } = useAuthPage();

  return (
    <AuthContainer
      title="Create your account"
      description="It's free — discover places, plan with AI and travel with guidance."
    >
      <RegisterForm
        onAuthenticated={(tokens) => signIn(tokens)}
        onRegistered={(email) =>
          router.replace(
            `/verify-otp${email ? `?email=${encodeURIComponent(email)}` : ""}`,
          )
        }
        onSwitchView={switchView}
      />
    </AuthContainer>
  );
};

export default RegisterPage;
