import AuthContainer from "./components/container";
import RegisterForm from "@/features/auth/components/register-form";
import useAuthPage from "./use-auth-page";

const RegisterPage = () => {
  const { switchView, signIn, navigate } = useAuthPage();

  return (
    <AuthContainer
      title="Create your account"
      description="It's free — discover places, plan with AI and travel with guidance."
    >
      <RegisterForm
        onAuthenticated={(tokens) => signIn(tokens)}
        onRegistered={(email) =>
          navigate("/verify-otp", { replace: true, state: { email } })
        }
        onSwitchView={switchView}
      />
    </AuthContainer>
  );
};

export default RegisterPage;
